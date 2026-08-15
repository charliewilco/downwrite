import { mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createOpenApiDocument } from "../dist-api/openapi.js";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const workerDirectory = path.resolve(scriptDirectory, "..");
const repositoryRoot = path.resolve(workerDirectory, "..");
const openApiDirectory = path.join(repositoryRoot, "iOS/OpenAPI");
const openApiPath = path.join(openApiDirectory, "openapi.json");
const generatorPackagePath = path.join(repositoryRoot, "iOS/OpenAPIGenerator");
const generatorConfigPath = path.join(
  openApiDirectory,
  "openapi-generator-config.yaml",
);
const outputDirectory = path.join(
  repositoryRoot,
  "iOS/DownwriteAPI/Sources/DownwriteAPI",
);

await mkdir(openApiDirectory, { recursive: true });
await mkdir(outputDirectory, { recursive: true });
await writeFile(
  openApiPath,
  `${JSON.stringify(createOpenApiDocument("http://localhost:8787/api/v1/openapi.json"), null, 2)}\n`,
);

const result = spawnSync(
  "swift",
  [
    "run",
    "--package-path",
    generatorPackagePath,
    "swift-openapi-generator",
    "generate",
    "--mode",
    "types",
    "--mode",
    "client",
    "--config",
    generatorConfigPath,
    "--output-directory",
    outputDirectory,
    openApiPath,
  ],
  { stdio: "inherit" },
);

if (result.error) {
  throw result.error;
}
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(
  `Generated ${path.relative(repositoryRoot, outputDirectory)} from ${path.relative(repositoryRoot, openApiPath)}.`,
);
