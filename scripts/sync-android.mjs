import { existsSync, mkdirSync, renameSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const apkPath = join(root, "public", "downloads", "atlas-palestine.apk");
const tempDir = join(root, ".tmp-native-build");
const tempApk = join(tempDir, "atlas-palestine.apk");
const androidDownloads = join(root, "android", "app", "src", "main", "assets", "public", "downloads");

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    shell: process.platform === "win32",
    stdio: "inherit"
  });

  if (result.status !== 0) process.exit(result.status ?? 1);
}

let movedApk = false;

try {
  if (existsSync(apkPath)) {
    mkdirSync(tempDir, { recursive: true });
    renameSync(apkPath, tempApk);
    movedApk = true;
  }

  rmSync(androidDownloads, { recursive: true, force: true });
  run("npm", ["run", "build:web"]);
  run("npx", ["cap", "sync", "android"]);
} finally {
  if (movedApk && existsSync(tempApk)) {
    mkdirSync(dirname(apkPath), { recursive: true });
    renameSync(tempApk, apkPath);
  }
}
