use std::process::Command;
use tauri::command;
use std::error::Error;
use std::fmt;
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc, TimeZone}; // Added TimeZone import here

#[derive(Debug)]
struct AppleScriptError(String);

impl fmt::Display for AppleScriptError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "AppleScript error: {}", self.0)
    }
}

impl Error for AppleScriptError {}

#[derive(Debug, Serialize, Deserialize)]
pub struct NoteDetails {
    content: String,
    modification_date: String, // ISO 8601 formatted date string
}

#[command]
pub async fn create_or_update_apple_note(title: String, content: String, note_id: Option<String>) -> Result<String, String> {
    // Check if we're on macOS
    let platform = tauri_plugin_os::platform();
    println!("Platform: {}", platform);

    if platform != "macos" {
        return Err("Apple Notes integration is only available on macOS".to_string());
    }

    // Format the title as a heading and combine with content
    let full_content = format!("{}\n\n{}", title, content);

    if let Some(id) = note_id {
        // Update existing note using its ID
        let script = r#"
        on run {noteId, noteContent}
            tell application "Notes"
                try
                    set theNote to note id noteId
                    set body of theNote to noteContent
                    return id of theNote
                on error errMsg
                    -- Note might have been deleted, create a new one
                    set folderName to "Ableton Live Manager"
                    set targetFolder to missing value

                    -- Find or create the folder
                    repeat with theFolder in folders
                        if the name of theFolder is folderName then
                            set targetFolder to theFolder
                            exit repeat
                        end if
                    end repeat

                    if targetFolder is missing value then
                        set targetFolder to make new folder with properties {name:folderName}
                    end if

                    -- Create new note
                    set newNote to make new note at targetFolder with properties {body:noteContent}
                    return id of newNote
                end try
            end tell
        end run
        "#;

        let output = Command::new("osascript")
            .arg("-e")
            .arg(script)
            .arg(id)
            .arg(full_content)
            .output();

        match output {
            Ok(output) => {
                if output.status.success() {
                    let result = String::from_utf8_lossy(&output.stdout).trim().to_string();
                    println!("AppleScript result: {}", result);
                    Ok(result)
                } else {
                    let error = String::from_utf8_lossy(&output.stderr).to_string();
                    println!("AppleScript failed: {}", error);
                    Err(format!("Failed to update Apple note: {}", error))
                }
            },
            Err(e) => {
                println!("Command execution failed: {}", e);
                Err(format!("Failed to execute AppleScript command: {}", e))
            }
        }
    } else {
        // Create new note
        let script = r#"
        on run {noteContent}
            tell application "Notes"
                set folderName to "Ableton Live Manager"
                set targetFolder to missing value

                -- Find or create the folder
                repeat with theFolder in folders
                    if the name of theFolder is folderName then
                        set targetFolder to theFolder
                        exit repeat
                    end if
                end repeat

                if targetFolder is missing value then
                    set targetFolder to make new folder with properties {name:folderName}
                end if

                -- Create new note
                set newNote to make new note at targetFolder with properties {body:noteContent}
                return id of newNote
            end tell
        end run
        "#;

        let output = Command::new("osascript")
            .arg("-e")
            .arg(script)
            .arg(full_content)
            .output();

        match output {
            Ok(output) => {
                if output.status.success() {
                    let result = String::from_utf8_lossy(&output.stdout).trim().to_string();
                    println!("AppleScript result: {}", result);
                    Ok(result)
                } else {
                    let error = String::from_utf8_lossy(&output.stderr).to_string();
                    println!("AppleScript failed: {}", error);
                    Err(format!("Failed to create Apple note: {}", error))
                }
            },
            Err(e) => {
                println!("Command execution failed: {}", e);
                Err(format!("Failed to execute AppleScript command: {}", e))
            }
        }
    }
}

#[command]
pub async fn get_apple_note_details(note_id: String) -> Result<NoteDetails, String> {
    // Check if we're on macOS
    let platform = tauri_plugin_os::platform();
    println!("Platform: {}", platform);

    if platform != "macos" {
        return Err("Apple Notes integration is only available on macOS".to_string());
    }

    // First get the content using a separate script
    let content_script = r#"
    on run {noteId}
        tell application "Notes"
            try
                set theNote to note id noteId
                return body of theNote
            on error errMsg
                error "Failed to get note content: " & errMsg
            end try
        end tell
    end run
    "#;

    let content_result = match Command::new("osascript")
        .arg("-e")
        .arg(content_script)
        .arg(&note_id)
        .output()
    {
        Ok(output) => {
            if output.status.success() {
                String::from_utf8_lossy(&output.stdout).trim().to_string()
            } else {
                let error = String::from_utf8_lossy(&output.stderr).to_string();
                return Err(format!("Failed to get note content: {}", error));
            }
        },
        Err(e) => {
            return Err(format!("Failed to execute content script: {}", e));
        }
    };

    // Use Unix timestamp script instead of parsing date components
    let date_script = r#"
    on run {noteId}
        tell application "Notes"
            try
                set theNote to note id noteId

                -- Use Unix timestamp directly (seconds since 1970-01-01)
                set modDate to modification date of theNote

                -- Get Unix timestamp in UTC
                set unixDate to (do shell script "date -j -f \"%a %b %d %T %Z %Y\" \"" & (modDate as string) & "\" +%s")

                return unixDate
            on error errMsg
                error "Failed to get modification date: " & errMsg
            end try
        end tell
    end run
    "#;

    let date_result = match Command::new("osascript")
        .arg("-e")
        .arg(date_script)
        .arg(&note_id)
        .output()
    {
        Ok(output) => {
            if output.status.success() {
                let unix_time_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
                // Parse the Unix timestamp
                match unix_time_str.parse::<i64>() {
                    Ok(unix_time) => {
                        // Convert Unix timestamp to ISO 8601 string
                        match Utc.timestamp_opt(unix_time, 0) {
                            chrono::LocalResult::Single(dt) => dt.to_rfc3339(),
                            _ => {
                                println!("Failed to parse timestamp: {}", unix_time);
                                // Fallback to current time
                                Utc::now().to_rfc3339()
                            }
                        }
                    },
                    Err(_) => {
                        println!("Failed to parse Unix timestamp: {}", unix_time_str);
                        // Fallback to current time
                        Utc::now().to_rfc3339()
                    }
                }
            } else {
                let error = String::from_utf8_lossy(&output.stderr).to_string();
                println!("AppleScript date error: {}", error);
                // Fallback to current time
                Utc::now().to_rfc3339()
            }
        },
        Err(e) => {
            println!("Date command failed: {}", e);
            // Fallback to current time
            Utc::now().to_rfc3339()
        }
    };

    // Create and return the NoteDetails struct
    Ok(NoteDetails {
        content: content_result,
        modification_date: date_result,
    })
}

#[command]
pub fn extract_note_parts(content: String) -> (String, String) {
    // Find the first double newline which separates title from content
    match content.find("\n\n") {
        Some(index) => {
            let title = content[..index].trim().to_string();
            let remaining_content = content[index + 2..].trim().to_string();
            (title, remaining_content)
        },
        None => {
            // If no double newline, treat the entire content as both title and content
            (content.clone(), content)
        }
    }
}
