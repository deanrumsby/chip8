import Chip8 from './chip8.js';

const chip8 = new Chip8();

const filePicker = document.querySelector('#load');

async function handleFileSelection(event) {
    const file = event.target.files[0];
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    chip8.load(bytes);
}

filePicker.addEventListener('change', handleFileSelection);