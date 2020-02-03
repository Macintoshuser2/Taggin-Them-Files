const { app, BrowserWindow, Menu, MenuItem, ipcMain, dialog } = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');

let selectedFiles;
let win;

function createWindow() {
    win = new BrowserWindow({
        width: 1000, 
        height: 800, 
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    win.on('closed', () => { 
        win = null; 
    });
}

const template = [
    {
        label: 'File',
        submenu: 
        [
            {
                label: 'Open File or Directory',
                click() {
                    openFileOrDirectory();
                }
            }
        ]
    },
    {
        role: 'window',
        submenu: 
        [
            { role: 'minimize' },
            { role: 'close' }
        ]
    }
];

if (process.platform === 'darwin') {
    template.unshift({
        label: app.getName(),
        submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    });
}

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

app.on('ready', createWindow);

app.on('window-all-closed', () => { 
    if (process.platform !== 'darwin') { 
        app.quit(); 
    } 
});

app.on('activate', () => { 
    if (win === null) { 
        createWindow(); 
    } 
});

/* 
    When this method fires, a dialog is opened that 
    allows auser to select multiple files of any type and opens to 
    the user's home directory by default.

    As the showOpenDialog function returns a JavaScript Promise,
    we handle the two possible outcomes of this Promise by assigning 
    the string array of the paths of the selected files 
    (or undefined if the user clicks or taps the cancel button) to a 
    variable called selectedFiles if the Promise successfully completes
    execution without error. Otherwise, we print the error that the Promise
    encountered during execution in the console.
*/
function openFileOrDirectory() {
    dialog.showOpenDialog(win, { 
        title: "Select File(s)", 
        defaultPath: process.env.HOME,
        buttonLabel: "Choose File(s)", 
        filters: 
        [
            { 
                name: 'All Files', 
                extensions: ['*'] 
            }
        ],
        properties: 
        [
            "openFile", 
            "multiSelections", 
            "showHiddenFiles", 
            "openDirectory"
        ]
    }).then(result => {
        selectedFiles = result.filePaths;

        if (selectedFiles !== undefined) {
            win.webContents.send('picked-files', { selected: selectedFiles });
        }
    }).catch(err => { 
        console.log(err); 
    });
}
