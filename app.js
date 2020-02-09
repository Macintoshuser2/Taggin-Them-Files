const { app, BrowserWindow, Menu, MenuItem, ipcMain, dialog, TouchBar, Tray} = require('electron');
const { TouchBarButton, TouchBarSpacer } = TouchBar;
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
        },
        resizable: false
    });

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    win.on('closed', () => { 
        win = null; 
    });

    app.accessibilitySupport = true;

    win.webContents.openDevTools();
    win.setTouchBar(setupTouchBar());
    setupTrayMenu();
}

const template = [
    {
        label: 'File',
        submenu: 
        [
            {
                label: 'Open File or Directory',
                accelerator: 'CmdOrCtrl+O',
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

        var files;
        var folders = getDirectories(selectedFiles);
        
        Array.from(folders).forEach(element => {
            const results = getAllFiles(element);

            Array.from(results).forEach(resultsElement => {
                files.push(resultsElement);
            });
        });
        
        win.webContents.send('picked-files', { selected: files });
    }).catch(err => { 
        console.log(err); 
    });
}

const getAllFiles = function(dirPath, arrayOfFiles) {
    var files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(__dirname, dirPath, "/", file));
        }
    });

    return arrayOfFiles;
}

function getDirectories(filesToAnalyze) {
    let directories = [];

    Array.from(filesToAnalyze).forEach(element => {
        try {
            var stat = fs.lstatSync(element);

            if (stat.isDirectory()) {
                directories.push(element);
            }
        } catch (error) {
            return [];
        }
    });

    return directories;
}

function setupTouchBar() {
    const openFileOrDirTBButton = new TouchBarButton({
        label: 'Open Files or Directory',
        backgroundColor: '#0000C0',
        click() {
            openFileOrDirectory();
        }
    });

    const addTagTBButton = new TouchBarButton({
        label: 'Add Custom Tag',
        backgroundColor: '#0000C0',
        click() {
            win.webContents.send('open-add', '');
        }
    });

    const touchBar = new TouchBar({
        items: [
            openFileOrDirTBButton,
            new TouchBarSpacer({ size: 'small' }),
            addTagTBButton
        ]
    });

    return touchBar;
}

function setupTrayMenu() {
    let tray = null;

    tray = new Tray('./assets/tray_icon.png');

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open Files or Directory',
            click() {
                openFileOrDirectory();
            }
        },
        {
            label: 'Add Custom Tag',
            click() {
                win.webContents.send('open-add', '');
            }
        }
    ]);

    tray.setContextMenu(contextMenu);
}
