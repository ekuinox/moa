use std::{env, path::PathBuf, process};

fn main() {
    let Some(path) = env::args_os().nth(1).map(PathBuf::from) else {
        eprintln!("usage: export_bindings <output-path>");
        process::exit(2);
    };

    moa_lib::interface::bindings::export_typescript_bindings(path)
        .expect("failed to export TypeScript bindings");
}
