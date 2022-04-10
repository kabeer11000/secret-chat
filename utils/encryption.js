import StorageIndex from "./indexes"
import {get, set} from "idb-keyval";
import {SignManager} from "./sign-verify/rsa-pss";
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

export const EncryptionManager = {
    encryptMessage, decryptMessage,
    utils: {
        getRandomValues: async () => {
            // const array = new Uint32Array(5);
            // const values = await self.crypto.getRandomValues(array);
            // return values
            return new TextEncoder().encode(crypto.randomUUID());
        },
        ArrayBufferToBase64URI: async (buffer) => {
            var binary = '';
            var bytes = new Uint8Array(buffer);
            var len = bytes.byteLength;
            for (var i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.encodeURIComponent(window.btoa(binary));
        }
    }
}

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
    if (savedKey) key = savedKey
    else key = await generateKey();
    // const key = savedKey ?? await generateKey();

    async function generateKey(save = true) {
        const _key = await window.crypto.subtle.generateKey(
            {
                name: "RSA-PSS",
                // Consider using a 4096-bit key for systems that require long-term security
                modulusLength: 1024,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256",
            },
            true,
            ["sign", "verify"]
        );
        if (save) await saveKey(_key);
        return _key
    }

    async function saveKey(key = key) {
        await set(StorageIndex.KEYPAIR, key);
        return key;
    }

    async function getId() {
        const id = await get(StorageIndex.SESSION_ID);
        if (id) return id;
        else {
            const _id = await EncryptionManager.utils.getRandomValues();
            await set(StorageIndex.SESSION_ID, _id);
            return _id;
        }
    }

    return {
        export: async () => {
            await saveKey();
        },
        baseRoute: "https://secret-chat-storage.withkn.tk",
        id: {
            getId
        },
        signature: {
            loadSignature: async () => {
                if (await get(StorageIndex.SESSION_SIGNATURE)) return await get(StorageIndex.SESSION_SIGNATURE);
                const id = new TextDecoder().decode(await getId());
                const {signature} = await SignManager.signMessage(key.privateKey, id/*await getId()*/);
                await set(StorageIndex.SESSION_SIGNATURE, signature);

                // console.log(await get(StorageIndex.SESSION_SIGNATURE), signature)

                // console.log("SignatureJS:ID: ", signature)
                return signature;
            }
        },
        key: key
    }
};
export const baseRoute = "https://secret-chat-storage.withkn.tk";

export const importRSAKey = async (pemEncodedKey) => {
    // from https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
    function str2ab(str) {
        const buf = new ArrayBuffer(str.length);
        const bufView = new Uint8Array(buf);
        for (let i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }

    function importRsaKey(pem) {
        // fetch the part of the PEM string between header and footer
        const pemHeader = "-----BEGIN PUBLIC KEY-----";
        const pemFooter = "-----END PUBLIC KEY-----";
        const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
        // base64 decode the string to get the binary data
        const binaryDerString = window.atob(pemContents);
        // convert from a binary string to an ArrayBuffer
        const binaryDer = str2ab(binaryDerString);

        return window.crypto.subtle.importKey(
            "spki",
            binaryDer,
            {
                name: "RSA-PSS",
                hash: "SHA-256"
            },
            true,
            ["verify"]
        );
    }

    return await importRsaKey(pemEncodedKey)
}
export const exportRSAKey = async (key) => {
    /*
Convert  an ArrayBuffer into a string
from https://developer.chrome.com/blog/how-to-convert-arraybuffer-to-and-from-string/
*/
    function ab2str(buf) {
        return String.fromCharCode.apply(null, new Uint8Array(buf));
    }

    /*
    Export the given key and write it into the "exported-key" space.
    */
    async function exportCryptoKey(key) {
        const exported = await window.crypto.subtle.exportKey(
            "spki",
            key
        );
        const exportedAsString = ab2str(exported);
        const exportedAsBase64 = window.btoa(exportedAsString);
        const pemExported = `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;

        // const exportKeyOutput = document.querySelector(".exported-key");
        // exportKeyOutput.textContent = pemExported;
        return pemExported
    }

    return exportCryptoKey(key)
}