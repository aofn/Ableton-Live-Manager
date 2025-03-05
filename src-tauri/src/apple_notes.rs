use std::process::Command;
use tauri::command;
use std::error::Error;
use std::fmt;

#[derive(Debug)]
struct AppleScriptError(String);

impl fmt::Display for AppleScriptError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "AppleScript error: {}", self.0)
    }
}

impl Error for AppleScriptError {}

#[command]
pub async fn create_apple_note(title: String, content: String) -> Result<(), String> {
    // Check if we're on macOS
    let platform = tauri_plugin_os::platform();
    println!("Platform: {}", platform);

    if platform == "macos" {
        // Use a more reliable method to run AppleScript with variables
        let output = Command::new("osascript")
            .arg("-e")
            .arg("on run {noteTitle, noteContent}")
            .arg("-e")
            .arg(r#"
                tell application "Notes"
                    set folderName to "Ableton Live Manager"

                    -- Check if folder exists
                    set folderExists to false
                    set targetFolder to missing value

                    repeat with theFolder in folders
                        if the name of theFolder is folderName then
                            set folderExists to true
                            set targetFolder to theFolder
                            exit repeat
                        end if
                    end repeat

                    -- Create folder if it doesn't exist
                    if not folderExists then
                        set targetFolder to make new folder with properties {name:folderName}
                    end if

                    -- Try to find existing note with the same title
                    set foundExistingNote to false
                    set theNote to missing value

                    tell targetFolder
                        repeat with existingNote in notes
                            if the name of existingNote is noteTitle then
                                set foundExistingNote to true
                                set theNote to existingNote
                                exit repeat
                            end if
                        end repeat

                        -- Update existing note or create new one
                        if foundExistingNote then
                            -- Use a placeholder title if the content doesn't start with one
                            -- This helps preserve the title formatting in Apple Notes
                            if (noteContent does not start with (noteTitle & "
")) then
                                -- Prepend the title to the content to ensure title is preserved
                                set updatedContent to noteTitle & "

" & noteContent
                                set body of theNote to updatedContent
                            else
                                -- Content already has the title, just update it
                                set body of theNote to noteContent
                            end if

                            -- Ensure name property is explicitly set
                            set name of theNote to noteTitle

                            return "Note updated successfully"
                        else
                            -- For new notes, always include the title in the content
                            set newContent to noteTitle & "

" & noteContent
                            -- Create new note with title and content
                            make new note with properties {name:noteTitle, body:newContent}
                            return "Note created successfully"
                        end if
                    end tell
                end tell
            "#)
            .arg("-e")
            .arg("end run")
            .arg(title)
            .arg(content)
            .output();

        match output {
            Ok(output) => {
                if output.status.success() {
                    let result = String::from_utf8_lossy(&output.stdout);
                    println!("AppleScript result: {}", result);
                    Ok(())
                } else {
                    let error = String::from_utf8_lossy(&output.stderr).to_string();
                    println!("AppleScript failed: {}", error);
                    Err(format!("Failed to create/update Apple note: {}", error))
                }
            },
            Err(e) => {
                println!("Command execution failed: {}", e);
                Err(format!("Failed to execute AppleScript command: {}", e))
            }
        }
    } else {
        Err("Apple Notes integration is only available on macOS".to_string())
    }
}
