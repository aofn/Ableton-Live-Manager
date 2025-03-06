import { invoke } from "@tauri-apps/api/core";

/**
 * Create or update an Apple Note with the given title and content
 * @param {string} title - The title of the note
 * @param {string} content - The content of the note
 * @param {string|null} noteId - Optional existing note ID to update
 * @returns {Promise<string>} - The ID of the created or updated note
 */
export async function createOrUpdateAppleNote(title, content, noteId = null) {
    try {
        const result = await invoke("create_or_update_apple_note", {
            title,
            content,
            noteId
        });

        console.log("Apple Notes result:", result);
        return result; // The note ID
    } catch (error) {
        console.error("Apple Notes error:", error);
        throw error;
    }
}

/**
 * Get details of an Apple Note including its content and modification date
 * @param {string} noteId - ID of the note to fetch
 * @returns {Promise<{content: string, modification_date: string}>} - Note details
 */
export async function getAppleNoteDetails(noteId) {
    try {
        const result = await invoke("get_apple_note_details", { noteId });
        console.log("Apple Note details fetched:", result);
        return result;
    } catch (error) {
        console.error("Failed to get Apple Note details:", error);
        throw error;
    }
}

/**
 * Extract project title and note content from the full note content
 * @param {string} fullContent - The complete note content including title
 * @returns {Promise<{title: string, content: string}>} - Separated title and content
 */
export async function extractNoteParts(fullContent) {
    try {
        const result = await invoke("extract_note_parts", { content: fullContent });
        const [title, content] = result;
        return { title, content };
    } catch (error) {
        console.error("Failed to extract note parts:", error);

        // Fallback extraction if the invoke fails
        const parts = fullContent.split("\n\n", 2);
        if (parts.length >= 2) {
            return {
                title: parts[0],
                content: parts.slice(1).join("\n\n")
            };
        }
        return { title: fullContent, content: fullContent };
    }
}
