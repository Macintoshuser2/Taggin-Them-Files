var ipc = require('electron').ipcRenderer;
var os = require('os');            

var selectBox;

var fullPaths = [];
var fileNamesOnly = [];

var toggleButton = document.getElementById('toggle-file-view');

toggleButton.disabled = true;
toggleButton.setAttribute('aria-disabled', 'true');

ipc.on('picked-files', (event, data) => {
    toggleButton.disabled = false;
    toggleButton.setAttribute('aria-disabled', 'false');

    selectBox = document.getElementById('paths');
    fullPaths = data.selected;

    var delimiter = os.platform() === "darwin" || os.platform() === "linux" ? '/' : '\\';

    Array.from(data.selected).forEach(element => {
        var filePathSplit = element.split(delimiter);
        var fileName = filePathSplit[filePathSplit.length - 1];

        fileNamesOnly.push(fileName);

        console.log(element);
    });

    Array.from(fullPaths).forEach(element => {
        selectBox.innerHTML += `<option>${element}</option>`;
    });

    toggleButton.addEventListener('click', () => {
        changeFileView(toggleButton, selectBox);
    });
});

function changeFileView(buttonToObserve, selectBoxToChange) {
    buttonToObserve.classList.toggle("on");

    if (buttonToObserve.classList.contains("on")) {
        changeTo(selectBoxToChange, fileNamesOnly);
        buttonToObserve.value = "Show Only Names (ON)";
        buttonToObserve.setAttribute('aria-pressed', 'true');
    } else {
        changeTo(selectBoxToChange, fullPaths);
        buttonToObserve.value = "Show Only Names (OFF)";
        buttonToObserve.setAttribute('aria-pressed', 'false');
    }
}

function changeTo(selectBoxToChange, selectedFilesArray) {
    selectBoxToChange.innerHTML = "";

    for (var i = 0; i < selectedFilesArray.length; i++) {
        selectBoxToChange.innerHTML += `<option>${selectedFilesArray[i]}</option>`;
    }
}

document.querySelector('#add-meta').addEventListener('click', openDialog);