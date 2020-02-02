const { app, BrowserWindow, Menu, MenuItem, ipcMain, dialog } = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');

let selectedFiles;
let win;

function createWindow() {
    win = new BrowserWindow({width: 1080, height: 600, webPreferences: {nodeIntegration: true}});

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    win.on('closed', () => { win = null; });
}

const template = [
    {
        role: 'window',
        submenu: [
            { role: 'minimize' },
            { role: 'close' }
        ]
    }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

app.on('ready', createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') { app.quit(); } });
app.on('activate', () => { if (win === null) { createWindow(); } });

/* 
    This is a listener that listens for a message being sent on the 
    channel called open-open-file-dialog. This message will be sent 
    from the renderer process.

    When this channel recieves a message, a dialog is opened that 
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
ipcMain.on('open-open-file-dialog', (event) => {
    dialog.showOpenDialog(win, { 
        title: "Select File(s)", 
        defaultPath: process.env.HOME,
        buttonLabel: "Choose File(s)", 
        filters: [{ name: 'All Files', extensions: ['*'] }],
        properties: ["openFile", "multiSelections", "showHiddenFiles", "openDirectory", ]
    }).then(result => {
        selectedFiles = result.filePaths;

        if (selectedFiles !== undefined) {
            fs.open('./db/files.json', 'w', (err, file) => { if (err) { throw err; } });

            fs.readFile('./db/files.json', 'utf8', (err, data) => {
                if (err) { throw err; }

                if (data.length > 0) {
                    selectedFilesObjects = JSON.parse(data);
                    console.log(selectedFilesObjects);
                }
            });

            Array.from(selectedFiles).forEach((value, index, array) => {
                selectedFilesObjects.push({ path: "" + value + "", metadata: [] });
            });

            fs.writeFile('./db/files.json', JSON.stringify(selectedFilesObjects), (err) => {
                if (err) { throw err; }
            });
        }
    }).catch(err => { console.log(err); });
});