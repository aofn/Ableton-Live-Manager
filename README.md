# Ableton Live Project Manager

This project is a tool designed to help manage Ableton Live projects.
![alm-example](https://github.com/marcel-klasse/Ableton-Live-Manager/assets/79279756/bbb852f7-ffaa-442e-a7c1-ec549a534c94)

## Features

- Scan and display Ableton Live project files from a specified directory.
- Add notes and tags to projects.
- Search projects by name and/or filter by tags.
- View project details such as tempo, number of tracks, used 3rd party plugins.
- Remove 3rd Party Plugins from projects and save as a copy.
- WIP: Pitch project up or down by a specified number of semitones and save as a copy.

## Notes

Every project has a note pad when you expand the project view.

Notes are saved inside a `alm.json` file, alongside any tags you add to a project. 
This file is located inside the Project folder.

## Tags

You can creat your own tags and add them to projects. Tags come in four variants:

* Default
* Outline
* Secondary
* Important

When adding tags to a project, the tags get saved inside the `alm.json` file's `tags` key.

## Removing 3rd Party Plugins

You can remove third party plugins from your project and save it as a copy. This can be useful for example with older Project files, which might contain corrupted plugins that crash Ableton Live.
The application will scan the project for third party plugins and display them in a list. You can then select which plugins you want to remove and save the project as a copy. 

**The original project will not be modified!**

#### Disclaimer:

Currently selecting the VST version of a plugin will remove all instances of this plugin from the project, including AU or VST3 instances and vice versa. 
In the future I want to add the option to select which plugin format you want to remove.

## What is alm.json?

You might notice a new file in your project folder called `alm.json`. 

This file is used to store information about your project like notes, tags and BPM so they can be displayed next to the project name, without having to rescan the entire `.als` file.
If you don't want to use ALM anymore youcan simply delete this file. 

_Important: If you delete this file, all notes and tags of this project will be lost!_

## Usage

1. Download the application.
2. Go to settings and set the directory path where your Ableton Live projects are located.
3. The application will scan the directory and display all Ableton Live project files.

## Development

1. Clone the repository: `git clone https://github.com/marcel-klasse/ableton-live-manager`
2. Navigate into the project directory: `cd ableton-live-project-manager`
3. Install the dependencies: `npm install`
4. Run the Tauri application: `npm run tauri dev`
5. Alternatively build the Tauri application: `npm run tauri build`

THe project uses Tailwind CSS and shadecn/ui as a UI framework. You can find the documentation here: https://ui.shadcn.com/

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Buy me a coffee

If you like this project and want to support me, consider buying me a coffee 🙂
https://www.buymeacoffee.com/anoldfrenchname
## License

[Gnu GPLv3](https://choosealicense.com/licenses/gpl-3.0/)
