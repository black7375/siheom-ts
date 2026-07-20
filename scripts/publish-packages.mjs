#!/usr/bin/env node
/**
 * Publish workspace packages to npm with workspace: protocol rewritten
 * to real semver (same behavior as pnpm publish).
 *
 * Bun publish does not rewrite workspace:*, which breaks consumers.
 */

import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PACKAGES_DIR = join(ROOT, "packages");

const PUBLISH_ORDER = [
  "@siheom/core",
  "@siheom/react",
  "@siheom/vue",
  "@siheom/svelte",
  "@siheom/angular",
  "@siheom/qwik",
  "@siheom/react-native",
  "@siheom/ime",
  "@siheom/vitest-browser-react",
];

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function getWorkspaceVersions() {
  const versions = new Map();
  for (const name of PUBLISH_ORDER) {
    const dir = name.replace("@siheom/", "");
    const pkgJson = readJson(join(PACKAGES_DIR, dir, "package.json"));
    versions.set(pkgJson.name, pkgJson.version);
  }
  return versions;
}

function rewriteWorkspaceSpec(spec, version) {
  if (spec === "workspace:*" || spec === "workspace:") {
    return version;
  }
  if (spec === "workspace:^") {
    return `^${version}`;
  }
  if (spec === "workspace:~") {
    return `~${version}`;
  }
  const range = spec.match(/^workspace:(.+)$/);
  if (range) {
    return range[1];
  }
  return spec;
}

function rewriteDeps(deps, workspaceVersions) {
  if (!deps) {
    return deps;
  }

  const result = {};
  for (const [name, spec] of Object.entries(deps)) {
    if (typeof spec === "string" && spec.startsWith("workspace:")) {
      const version = workspaceVersions.get(name);
      if (!version) {
        throw new Error(`Unknown workspace dependency: ${name}`);
      }
      result[name] = rewriteWorkspaceSpec(spec, version);
    } else {
      result[name] = spec;
    }
  }
  return result;
}

function isPublished(name, version) {
  const result = spawnSync("npm", ["view", `${name}@${version}`, "version"], {
    encoding: "utf8",
  });
  return result.status === 0;
}

function publishPackage(packageName, { otp, dryRun }) {
  const dirName = packageName.replace("@siheom/", "");
  const packageDir = join(PACKAGES_DIR, dirName);
  const workspaceVersions = getWorkspaceVersions();
  const pkgJson = readJson(join(packageDir, "package.json"));

  if (pkgJson.private) {
    return { name: packageName, version: pkgJson.version, result: "private" };
  }

  if (isPublished(pkgJson.name, pkgJson.version)) {
    return { name: packageName, version: pkgJson.version, result: "skipped" };
  }

  const exportable = structuredClone(pkgJson);
  exportable.dependencies = rewriteDeps(exportable.dependencies, workspaceVersions);
  exportable.devDependencies = rewriteDeps(exportable.devDependencies, workspaceVersions);
  exportable.peerDependencies = rewriteDeps(exportable.peerDependencies, workspaceVersions);
  delete exportable.scripts;

  const tempDir = mkdtempSync(join(tmpdir(), "siheom-publish-"));
  try {
    cpSync(join(packageDir, "dist"), join(tempDir, "dist"), { recursive: true });
    writeFileSync(join(tempDir, "package.json"), `${JSON.stringify(exportable, null, 2)}\n`);

    const args = ["publish", tempDir, "--access", "public"];
    if (otp) {
      args.push("--otp", otp);
    }
    if (dryRun) {
      args.push("--dry-run");
    }

    const result = spawnSync("npm", args, { stdio: "inherit" });
    if (result.status !== 0) {
      throw new Error(`Failed to publish ${pkgJson.name}@${pkgJson.version}`);
    }

    return {
      name: packageName,
      version: pkgJson.version,
      result: dryRun ? "dry-run" : "published",
    };
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

function parseArgs(argv) {
  const otpIndex = argv.indexOf("--otp");
  return {
    otp: otpIndex >= 0 ? argv[otpIndex + 1] : undefined,
    dryRun: argv.includes("--dry-run"),
    packages: argv.filter((arg) => arg.startsWith("@siheom/")),
  };
}

const { otp, dryRun, packages } = parseArgs(process.argv.slice(2));
const targets =
  packages.length > 0
    ? PUBLISH_ORDER.filter((name) => packages.includes(name))
    : PUBLISH_ORDER.filter((name) => {
        const dirName = name.replace("@siheom/", "");
        const pkgJson = readJson(join(PACKAGES_DIR, dirName, "package.json"));
        return !pkgJson.private;
      });

const results = [];
for (const packageName of targets) {
  results.push(publishPackage(packageName, { otp, dryRun }));
}

for (const result of results) {
  console.log(`${result.name}@${result.version}: ${result.result}`);
}

const failed = results.some((result) => result.result === "failed");
process.exit(failed ? 1 : 0);
