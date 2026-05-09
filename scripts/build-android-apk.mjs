import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const androidDir = join(root, "android");
const outputApk = join(androidDir, "app", "build", "outputs", "apk", "debug", "app-debug.apk");
const publicApk = join(root, "public", "downloads", "atlas-palestine.apk");

function run(command, args, cwd = root) {
  const result = spawnSync(command, args, {
    cwd,
    shell: process.platform === "win32",
    stdio: "inherit"
  });

  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("node", ["scripts/sync-android.mjs"]);

const gradle = process.platform === "win32" ? "gradlew.bat" : "./gradlew";
run(gradle, ["assembleDebug"], androidDir);

if (!existsSync(outputApk)) {
  console.error(`APK was not created at ${outputApk}`);
  process.exit(1);
}

mkdirSync(dirname(publicApk), { recursive: true });
copyFileSync(outputApk, publicApk);
console.log(`Copied APK to ${publicApk}`);
