use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

use anyhow::{Context, Result, bail};
use clap::{Args, Parser, Subcommand};
use dialoguer::{Confirm, Input, Select, theme::ColorfulTheme};
use rand::distr::{Alphanumeric, SampleString};

#[derive(Parser)]
#[command(name = "downwrite")]
#[command(about = "Setup and manage a self-hosted Downwrite instance.")]
struct Cli {
    #[arg(long, global = true, value_name = "PATH")]
    root: Option<PathBuf>,

    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    Init(InitArgs),
    Dev,
    Status,
    Deploy(DeployArgs),
    Secret(SecretCommand),
}

#[derive(Args)]
struct InitArgs {
    #[arg(long)]
    production: bool,

    #[arg(long)]
    local: bool,
}

#[derive(Args)]
struct DeployArgs {
    #[arg(long)]
    skip_validate: bool,
}

#[derive(Args)]
struct SecretCommand {
    #[command(subcommand)]
    command: SecretCommands,
}

#[derive(Subcommand)]
enum SecretCommands {
    RotateBootstrapToken,
}

#[derive(Debug, Clone, Copy)]
enum SetupMode {
    Local,
    Production,
    Both,
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    let root = project_root(cli.root)?;

    match cli.command {
        Commands::Init(args) => init(&root, args),
        Commands::Dev => run_worker_script(&root, "dev"),
        Commands::Status => status(&root),
        Commands::Deploy(args) => deploy(&root, args),
        Commands::Secret(command) => match command.command {
            SecretCommands::RotateBootstrapToken => rotate_bootstrap_token(),
        },
    }
}

fn project_root(explicit_root: Option<PathBuf>) -> Result<PathBuf> {
    if let Some(path) = explicit_root {
        let root = path
            .canonicalize()
            .with_context(|| format!("failed to resolve {}", path.display()))?;
        validate_project_root(&root)?;
        return Ok(root);
    }

    let current_dir = std::env::current_dir().context("failed to read current directory")?;
    for candidate in current_dir.ancestors() {
        if candidate.join("worker/package.json").is_file() {
            return Ok(candidate.to_path_buf());
        }
    }

    bail!(
        "{} is not inside a Downwrite checkout: worker/package.json is missing",
        current_dir.display()
    );
}

fn validate_project_root(root: &Path) -> Result<()> {
    if root.join("worker/package.json").is_file() {
        Ok(())
    } else {
        bail!(
            "{} does not look like a Downwrite checkout: worker/package.json is missing",
            root.display()
        )
    }
}

fn init(root: &Path, args: InitArgs) -> Result<()> {
    let theme = ColorfulTheme::default();
    let mode = setup_mode(&theme, &args)?;
    let worker_name = prompt_text(&theme, "Cloudflare Worker name", "downwrite")?;
    let public_url = prompt_text(&theme, "Public instance URL", "https://write.example.com")?;
    let rp_name = prompt_text(&theme, "WebAuthn RP name", "Downwrite")?;
    let rp_id_default =
        hostname_from_url(&public_url).unwrap_or_else(|| "write.example.com".to_string());
    let rp_id = prompt_text(&theme, "WebAuthn RP ID", &rp_id_default)?;
    let d1_database = prompt_text(&theme, "D1 database name", "downwrite")?;
    let r2_bucket = prompt_text(&theme, "R2 bucket name", "downwrite-content")?;
    let bootstrap_token = generate_token();

    println!();
    println!("Downwrite setup plan");
    println!("  Mode: {}", setup_mode_label(mode));
    println!("  Worker: {worker_name}");
    println!("  Public URL: {public_url}");
    println!("  WebAuthn RP name: {rp_name}");
    println!("  WebAuthn RP ID: {rp_id}");
    println!("  D1 database: {d1_database}");
    println!("  R2 bucket: {r2_bucket}");
    println!("  AUTH_BOOTSTRAP_TOKEN: {bootstrap_token}");
    println!();

    if matches!(mode, SetupMode::Local | SetupMode::Both) {
        println!("Local setup command:");
        println!(
            "  cd {} && npm run dev:prepare",
            root.join("worker").display()
        );
    }

    if matches!(mode, SetupMode::Production | SetupMode::Both) {
        println!("Production setup commands:");
        println!("  wrangler d1 create {d1_database}");
        println!("  wrangler r2 bucket create {r2_bucket}");
        println!("  wrangler secret put AUTH_BOOTSTRAP_TOKEN");
        println!("  cd {} && npm run deploy", root.join("worker").display());
    }

    println!();
    println!(
        "This Rust CLI scaffold is ready for the next step: wiring these answers into wrangler.toml and Wrangler provisioning."
    );

    Ok(())
}

fn setup_mode(theme: &ColorfulTheme, args: &InitArgs) -> Result<SetupMode> {
    if args.local && args.production {
        return Ok(SetupMode::Both);
    }

    if args.local {
        return Ok(SetupMode::Local);
    }

    if args.production {
        return Ok(SetupMode::Production);
    }

    let options = ["Local development", "Production deploy", "Both"];
    let selection = Select::with_theme(theme)
        .with_prompt("Setup mode")
        .items(options)
        .default(0)
        .interact()
        .context("failed to read setup mode")?;

    Ok(match selection {
        0 => SetupMode::Local,
        1 => SetupMode::Production,
        _ => SetupMode::Both,
    })
}

fn prompt_text(theme: &ColorfulTheme, prompt: &str, default: &str) -> Result<String> {
    Input::with_theme(theme)
        .with_prompt(prompt)
        .default(default.to_string())
        .interact_text()
        .with_context(|| format!("failed to read {prompt}"))
}

fn setup_mode_label(mode: SetupMode) -> &'static str {
    match mode {
        SetupMode::Local => "local development",
        SetupMode::Production => "production deploy",
        SetupMode::Both => "local development and production deploy",
    }
}

fn status(root: &Path) -> Result<()> {
    println!("Downwrite status");
    check_file(root.join("worker/package.json"), "Worker package")?;
    check_file(root.join("worker/wrangler.toml"), "Wrangler config")?;
    check_file(
        root.join("worker/migrations/0001_initial.sql"),
        "D1 migrations",
    )?;

    check_tool("npm");
    check_tool("wrangler");

    if which::which("wrangler").is_ok() {
        let output = Command::new("wrangler")
            .arg("whoami")
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()
            .context("failed to run wrangler whoami")?;

        if output.status.success() {
            println!("  ok  Cloudflare login");
        } else {
            println!("  warn  Cloudflare login is not ready");
        }
    }

    Ok(())
}

fn check_file(path: PathBuf, label: &str) -> Result<()> {
    if path.is_file() {
        println!("  ok  {label}");
        Ok(())
    } else {
        bail!("missing {label}: {}", path.display());
    }
}

fn check_tool(name: &str) {
    if which::which(name).is_ok() {
        println!("  ok  {name}");
    } else {
        println!("  warn  {name} was not found on PATH");
    }
}

fn deploy(root: &Path, args: DeployArgs) -> Result<()> {
    if !args.skip_validate {
        run_worker_script(root, "validate")?;
    }

    let confirmed = Confirm::with_theme(&ColorfulTheme::default())
        .with_prompt("Deploy to Cloudflare now?")
        .default(false)
        .interact()
        .context("failed to read deploy confirmation")?;

    if !confirmed {
        println!("Deploy cancelled.");
        return Ok(());
    }

    run_worker_script(root, "deploy")
}

fn run_worker_script(root: &Path, script: &str) -> Result<()> {
    let worker = root.join("worker");
    let status = Command::new("npm")
        .args(["run", script])
        .current_dir(&worker)
        .status()
        .with_context(|| format!("failed to run npm run {script} in {}", worker.display()))?;

    if !status.success() {
        bail!("npm run {script} failed");
    }

    Ok(())
}

fn rotate_bootstrap_token() -> Result<()> {
    println!("{}", generate_token());
    Ok(())
}

fn generate_token() -> String {
    Alphanumeric.sample_string(&mut rand::rng(), 32)
}

fn hostname_from_url(value: &str) -> Option<String> {
    value
        .strip_prefix("https://")
        .or_else(|| value.strip_prefix("http://"))
        .and_then(|without_scheme| without_scheme.split('/').next())
        .filter(|host| !host.is_empty())
        .map(str::to_string)
}
