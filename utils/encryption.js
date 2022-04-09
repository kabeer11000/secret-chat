import StorageIndex from "./indexes"
import {get, set} from "idb-keyval";
/*
Store the calculated ciphertext and counter here, so we can decrypt the message later.
*/
// let ciphertext;
// let counter;

/*
Fetch the contents of the "message" textbox, and encode it
in a form we can use for the encrypt operation.
*/
function getMessageEncoding(message) {
    let enc = new TextEncoder();
    return enc.encode(message);
}

/*
Get the encoded message, encrypt it and display a representation
of the ciphertext in the "Ciphertext" element.
*/
async function encryptMessage(key, text) {
    let encoded = getMessageEncoding(text);
    // The counter block value must never be reused with a given key.
    const counter = window.crypto.getRandomValues(new Uint8Array(16));
    const ciphertext = await window.crypto.subtle.encrypt(
        {
            name: "AES-CTR",
            counter,
            length: 64
        },
        key,
        encoded
    );

    // let buffer = new Uint8Array(ciphertext, 0, 5);
    // const ciphertextValue = document.querySelector(".aes-ctr .ciphertext-value");
    // ciphertextValue.classList.add('fade-in');
    // ciphertextValue.addEventListener('animationend', () => {
    //     ciphertextValue.classList.remove('fade-in');
    // });
    // ciphertextValue.textContent = `${buffer}...[${ciphertext.byteLength} bytes total]`;
    return {ciphertext, counter}
}

/*
Fetch the ciphertext and decrypt it.
Write the decrypted message into the "Decrypted" box.
*/
async function decryptMessage(key, ciphertext, counter) {
    let decrypted = await window.crypto.subtle.decrypt(
        {
            name: "AES-CTR",
            counter,
            length: 64
        },
        key,
        ciphertext
    );

    let dec = new TextDecoder();

    return {decrypted, text: dec.decode(decrypted)};
}

export const KeyManager = async () => {
    const savedKey = await get(StorageIndex.SECRET_KEY);
    let key;
    if (savedKey) {
        key = await window.crypto.subtle.importKey('raw', savedKey, {
                name: "AES-CTR",
                length: 256
            },
            true,
            ["encrypt", "decrypt"]
        );
    } else {
        key = await window.crypto.subtle.generateKey(
            {
                name: "AES-CTR",
                length: 256
            },
            true,
            ["encrypt", "decrypt"]
        );
        await saveKey()
    }

    async function saveKey() {
        const exported = await window.crypto.subtle.exportKey(
            "raw",
            key
        );
        await set(StorageIndex.SECRET_KEY, new Uint8Array(exported));
        return exported;
    }

    return {
        export: async () => {
            await saveKey();
        },
        key: key
    }
};
export const EncryptionManager = {
    encryptMessage, decryptMessage,
    utils: {
        ArrayBufferToBase64URI: async (buffer) => {
            var binary = '';
            var bytes = new Uint8Array(buffer);
            var len = bytes.byteLength;
            for (var i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
        }
    }
}
