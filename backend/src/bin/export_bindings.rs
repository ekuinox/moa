fn main() {
    moa_lib::interface::bindings::export_typescript_bindings()
        .expect("failed to export TypeScript bindings");
}
