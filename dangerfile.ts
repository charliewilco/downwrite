import { message, danger, schedule } from "danger";
import * as fs from "fs";

const pr = danger.github.pr;
const modified = danger.git.modified_files;
const bodyAndTitle = (pr.body + pr.title).toLowerCase();
const trivialPR = bodyAndTitle.includes("#trivial");

const PATTERN = /console\.(log|error|warn|info)/;
const GLOBAL_PATTERN = new RegExp(PATTERN.source, "g");
const JS_FILE = /\.(js|ts)x?$/i;
const PATH = "client";

interface NoConsoleOptions {
  whitelist?: string[];
}

async function noConsole(options: NoConsoleOptions = {}) {
  const whitelist = options.whitelist || [];
  if (!Array.isArray(whitelist))
    throw new Error("[no-console] whitelist option has to be an array.");

  const files = danger.git.modified_files
    .concat(danger.git.created_files)
    .filter(file => JS_FILE.test(file));
  const contents = await Promise.all(
    files.map(file =>
      danger.github.utils.fileContents(file).then(content => ({
        file,
        content
      }))
    )
  );

  contents.forEach(({ file, content }) => {
    let matches = content.match(GLOBAL_PATTERN);
    if (!matches) return;
    matches = matches.filter(match => {
      const singleMatch = PATTERN.exec(match);
      if (!singleMatch || singleMatch.length === 0) return false;
      return !whitelist.includes(singleMatch[1]);
    });
    if (matches.length === 0) return;

    fail(`${matches.length} console statement(s) left in ${file}.`);
  });
}

// Rules

const filesOnly = (file: string) =>
  fs.existsSync(file) && fs.lstatSync(file).isFile();

// When there are app-changes and it's not a PR marked as trivial, expect
// there to be CHANGELOG changes.
const modifiedAppFiles = modified
  .filter(p => p.includes(PATH))
  .filter(p => filesOnly(p));

const changelogChanges = modified.includes("CHANGELOG.md");
if (modifiedAppFiles.length > 0 && !trivialPR && !changelogChanges) {
  fail(
    "**No CHANGELOG added.** If this is a small PR, or a bug-fix for an unreleased bug add `#trivial` to your PR message and re-run CI."
  );
}

const modifiedMD = danger.git.modified_files.join("- ");
message("Changed Files in this PR: \n - " + modifiedMD);

schedule(noConsole({ whitelist: ["error", "warn"] }));
