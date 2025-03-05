import { invoke } from '@tauri-apps/api/core';

/**
 * Creates a note in Apple Notes with the specified title and content
 * The note will be created in the "Ableton Live Manager" folder
 * The folder will be created if it doesn't exist
 *
 * @param {string} title - The title of the note
 * @param {string} content - The content of the note
 * @returns {Promise<void>} - A promise that resolves when the note is created
 */
export async function createAppleNote(title, content) {
    try {
        // Only attempt to create Apple note on macOS
        if (await isMacOS()) {
            return await invoke('create_apple_note', { title, content });
        } else {
            console.log('Apple Notes integration is only available on macOS');
            return Promise.resolve();
        }
    } catch (error) {
        console.error('Failed to create Apple note:', error);
        throw error;
    }
}

/**
 * Check if the current platform is macOS
 *
 * @returns {Promise<boolean>} - A promise that resolves to true if the platform is macOS
 */
async function isMacOS() {
    try {
        const { platform } = await import('@tauri-apps/plugin-os');
        console.log('Platform:', await platform());
        return (await platform()) === 'macos';
    } catch (error) {
        console.log(error)
        console.error('Failed to detect platform:', error);
        return false;
    }
}
