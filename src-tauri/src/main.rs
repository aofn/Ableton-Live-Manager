// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::fs::metadata;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, print_this, is_file,])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

#[tauri::command(rename_all = "snake_case")]
fn is_file(path: &str) -> Result<bool, &str> {
    if path.ends_with(".DS_Store")
        || path.contains("Ableton Project Info")
        || path.contains("Icon\r")
    {
        return Err("not a folder or .als file");
    }
    let md = metadata(path).unwrap();
    let is_dir = md.is_dir();
    Ok(is_dir)
}

#[tauri::command(rename_all = "snake_case")]
fn print_this(invoke_message: String) {
    println!(
        "I was invoked from JS, with this message: {}",
        invoke_message
    );
}
