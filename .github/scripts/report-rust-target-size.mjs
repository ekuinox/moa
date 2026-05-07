#!/usr/bin/env node

/**
 * Rust の Cargo target ディレクトリのサイズを出力するスクリプトです。
 *
 * 人が読みやすい合計サイズと直下ディレクトリ別の表を、標準出力と
 * GitHub Actions の step summary の両方へ書き出します。
 * CI 以外でも検証しやすく、GitHub-hosted runner の OS に依存しないよう
 * 単体の Node.js スクリプトとして置いています。
 */

import { appendFile, lstat, opendir } from "node:fs/promises";
import path from "node:path";

const DEFAULT_TARGET_PATH = "backend/target";

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const targetPath = path.resolve(options.targetPath ?? DEFAULT_TARGET_PATH);
  const summaryPath = options.summaryPath ?? process.env.GITHUB_STEP_SUMMARY;

  const summary = createSummaryWriter(summaryPath);
  await summary.writeLine("# Rust target size");
  await summary.writeLine();

  if (!(await pathExists(targetPath))) {
    const message = `${path.relative(process.cwd(), targetPath) || targetPath} does not exist.`;
    console.log(message);
    await summary.writeLine(message);
    return;
  }

  // debug / release / package など、どの直下ディレクトリが大きいかを
  // summary で確認できるように、それぞれ個別に計測します。
  const childDirectories = await listChildDirectories(targetPath);
  const rows = [];
  for (const childPath of childDirectories) {
    const bytes = await getDirectorySizeBytes(childPath);
    rows.push({
      name: path.basename(childPath),
      bytes,
      size: formatBytes(bytes),
    });
  }

  rows.sort((left, right) => right.bytes - left.bytes);

  const totalBytes = await getDirectorySizeBytes(targetPath);
  const totalLine = `Total: ${formatBytes(totalBytes)}`;

  console.log(totalLine);
  await summary.writeLine(totalLine);
  await summary.writeLine();
  await summary.writeLine("| Directory | Size | Bytes |");
  await summary.writeLine("| --- | ---: | ---: |");

  for (const row of rows) {
    console.log(`${row.name}: ${row.size} (${row.bytes} bytes)`);
    await summary.writeLine(`| ${escapeMarkdownCell(row.name)} | ${row.size} | ${row.bytes} |`);
  }
}

function parseArgs(args) {
  const options = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--target") {
      options.targetPath = readOptionValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--summary") {
      options.summaryPath = readOptionValue(args, index, arg);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function readOptionValue(args, index, optionName) {
  const value = args[index + 1];
  if (!value) {
    throw new Error(`${optionName} requires a value.`);
  }

  return value;
}

function createSummaryWriter(summaryPath) {
  return {
    async writeLine(line = "") {
      if (!summaryPath) {
        return;
      }

      await appendFile(summaryPath, `${line}\n`, "utf8");
    },
  };
}

async function pathExists(targetPath) {
  try {
    await lstat(targetPath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

async function listChildDirectories(targetPath) {
  const directories = [];
  const directory = await opendir(targetPath);

  for await (const entry of directory) {
    if (entry.isDirectory()) {
      directories.push(path.join(targetPath, entry.name));
    }
  }

  return directories;
}

async function getDirectorySizeBytes(targetPath) {
  let total = 0;
  const directory = await opendir(targetPath);

  // Windows runner とローカル環境で同じ挙動にするため、du などの外部コマンドに
  // 依存せず Node.js の API で再帰的に走査します。
  for await (const entry of directory) {
    const entryPath = path.join(targetPath, entry.name);
    if (entry.isDirectory()) {
      total += await getDirectorySizeBytes(entryPath);
      continue;
    }

    if (entry.isFile()) {
      const stats = await lstat(entryPath);
      total += stats.size;
    }
  }

  return total;
}

function formatBytes(bytes) {
  const units = [
    ["GiB", 1024 ** 3],
    ["MiB", 1024 ** 2],
    ["KiB", 1024],
  ];

  for (const [unit, size] of units) {
    if (bytes >= size) {
      return `${(bytes / size).toLocaleString("en-US", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      })} ${unit}`;
    }
  }

  return `${bytes} B`;
}

function escapeMarkdownCell(value) {
  return value.replaceAll("|", "\\|");
}
