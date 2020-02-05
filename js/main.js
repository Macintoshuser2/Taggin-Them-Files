var ipc = require('electron').ipcRenderer;
            
var selectBox;

var fullPaths = [];
var fileNamesOnly = [];

var checkbox = document.getElementById('indeterminate-checkbox');

ipc.on('picked-files', (event, data) => {
    selectBox = document.getElementById('paths');
    fullPaths = data.selected;

    for (var i = 0; i < data.selected.length; i++) {
        var length = data.selected[i].split('\\').length - 1


        fileNamesOnly.push(data.selected[i].split('\\')[length]);
    }

    for (var i = 0; i < fullPaths.length; i++) {
        selectBox.innerHTML += `<option>${fullPaths[i]}</option>`;
    }

    checkbox.addEventListener('click', () => {
        changeFileView(checkbox, selectBox);
    });
});

function changeFileView(checkboxToObserve, selectBoxToChange) {
    if (checkboxToObserve.checked) {
        changeTo(selectBoxToChange, fileNamesOnly);
    } else {
        changeTo(selectBoxToChange, fullPaths);
    }
}

function changeTo(selectBoxToChange, selectedFilesArray) {
    selectBoxToChange.innerHTML = "";

    for (var i = 0; i < selectedFilesArray.length; i++) {
        selectBoxToChange.innerHTML += `<option>${selectedFilesArray[i]}</option>`;
    }
}

document.querySelector('#add-meta').addEventListener('click', openDialog);