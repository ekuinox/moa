use std::{env, path::PathBuf, process::Command};

use chrono::{SecondsFormat, Utc};

fn main() {
    emit_build_info();
    tauri_build::build();
}

fn emit_build_info() {
    println!("cargo:rerun-if-changed=build.rs");
    println!("cargo:rerun-if-changed=../.git/HEAD");
    println!("cargo:rerun-if-env-changed=MOA_COMMIT_HASH");
    println!("cargo:rerun-if-env-changed=GITHUB_SHA");
    if let Some(head_ref) = current_git_head_ref() {
        println!("cargo:rerun-if-changed=../.git/{head_ref}");
    }

    println!("cargo:rustc-env=MOA_COMMIT_HASH={}", commit_hash());
    println!("cargo:rustc-env=MOA_BUILD_TIMESTAMP={}", build_timestamp());
}

fn current_git_head_ref() -> Option<String> {
    let manifest_dir = PathBuf::from(env::var_os("CARGO_MANIFEST_DIR")?);
    let head = std::fs::read_to_string(manifest_dir.join("../.git/HEAD")).ok()?;

    head.strip_prefix("ref: ")
        .map(|value| value.trim().to_owned())
}

fn commit_hash() -> String {
    env_commit_hash("MOA_COMMIT_HASH")
        .or_else(|| env_commit_hash("GITHUB_SHA"))
        .or_else(|| run_command("git", &["rev-parse", "--short", "HEAD"]))
        .unwrap_or_else(|| "unknown".to_owned())
}

fn build_timestamp() -> String {
    Utc::now().to_rfc3339_opts(SecondsFormat::Secs, true)
}

fn env_commit_hash(name: &str) -> Option<String> {
    let value = env::var(name).ok()?;
    let trimmed = value.trim();
    if trimmed.is_empty() {
        return None;
    }

    Some(trimmed.chars().take(7).collect())
}

fn run_command(program: &str, args: &[&str]) -> Option<String> {
    let output = Command::new(program).args(args).output().ok()?;
    if !output.status.success() {
        return None;
    }

    let value = String::from_utf8(output.stdout).ok()?.trim().to_owned();
    (!value.is_empty()).then_some(value)
}
