const KEYCODES = { ESCAPE: 27 };

const dialog = document.querySelector('.dialog');
const dialogMask = dialog.querySelector('.dialog-mask');
const dialogWindow = dialog.querySelector('.dialog-window');

let previousActiveElement;

function openDialog() {
    previousActiveElement = document.activeElement;

    Array.from(document.body.children).forEach(child => {
        if (child !== dialog) {
            child.inert = true;
        }
    });

    dialog.classList.add('opened');

    dialogMask.addEventListener('click', closeDialog);

    let closeButton = dialogWindow.querySelector('#close-button');
    let addButton = dialogWindow.querySelector('#add-tag-button');

    closeButton.addEventListener('click', closeDialog);
    addButton.addEventListener('click', addTag);

    document.addEventListener('keydown', checkCloseDialog);

    dialog.querySelector('#tag-name-input').focus();
}

function checkCloseDialog(e) {
    if (e.keyCode === KEYCODES.ESCAPE) {
        closeDialog();
    }
}

function closeDialog() {
    dialogMask.removeEventListener('click', closeDialog);

    dialogWindow.querySelectorAll('button').forEach(btn => {
        btn.removeEventListener('click', closeDialog);
    });

    document.removeEventListener('keydown', checkCloseDialog);

    Array.from(document.body.children).forEach(child => {
        if (child !== dialog) {
            child.inert = false;
        }
    });

    dialog.classList.remove('opened');

    previousActiveElement.focus();
}

function addTag() {
    let metaBox = document.querySelector('#metadata');
    let inputBox = document.querySelector('#tag-name-input');

    metaBox.innerHTML += `<option>${inputBox.value}</option>`;

    closeDialog();   
}
