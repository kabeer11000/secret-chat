/*
Store the calculated signature here, so we can verify it later.
*/

/*
Fetch the contents of the "message" textbox, and encode it
in a form we can use for sign operation.
*/
import {set} from "idb-keyval";

function getMessageEncoding(message) {
    // const messageBox = document.querySelector("#rsa-pss-message");
    // let message = messageBox.value;
    let enc = new TextEncoder();
    return enc.encode(message);
}

/*
Get the encoded message-to-sign, sign it and display a representation
of the first part of it in the "signature" element.
*/
async function signMessage(privateKey, message) {
    // const signatureValue = document.querySelector(".rsa-pss .signature-value");
    // signatureValue.classList.remove("valid", "invalid");

    let encoded = getMessageEncoding(message);
    const signature = await window.crypto.subtle.sign(
        {
            name: "RSA-PSS",
            saltLength: 32,
        },
        privateKey,
        encoded
    );
    // let buffer = new Uint8Array(signature, 0, 5);
    return {signature}
    // signatureValue.textContent = `${buffer}...[${signature.byteLength} bytes total]`;
}

/*
Fetch the encoded message-to-sign and verify it against the stored signature.
* If it checks out, set the "valid" class on the signature.
* Otherwise set the "invalid" class.
*/
async function verifyMessage(publicKey, signature, message) {
    // const signatureValue = document.querySelector(".rsa-pss .signature-value");
    // signatureValue.classList.remove("valid", "invalid");

    let encoded = getMessageEncoding(message);
    return await window.crypto.subtle.verify(
        {
            name: "RSA-PSS",
            saltLength: 32,
        },
        publicKey,
        signature,
        encoded
    );

    // signatureValue.classList.add(result ? "valid" : "invalid");
}
export const SignManager = {
    signMessage, verifyMessage, getMessageEncoding
}
export const generate = async () => {
    /*
    Generate a sign/verify key, then set up event listeners
    on the "Sign" and "Verify" buttons.
    */
    window.crypto.subtle.generateKey(
        {
            name: "RSA-PSS",
            // Consider using a 4096-bit key for systems that require long-term security
            modulusLength: 1024,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["sign", "verify"]
    ).then(async (keyPair) => {
        const message = "APP";
        const signature = await signMessage(keyPair.privateKey, message);
        console.log(signature);
        console.log(await verifyMessage(keyPair.publicKey, signature[0], message))
        await set("KEY", keyPair)
    });
}