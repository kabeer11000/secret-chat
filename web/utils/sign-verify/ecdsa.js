/*
Fetch the contents of the "message" textbox, and encode it
in a form we can use for the sign operation.
*/
function getMessageEncoding(message) {
    let enc = new TextEncoder();
    return enc.encode(message);
}

async function signMessage(privateKey, message) {

    let encoded = getMessageEncoding();
    let signature = await window.crypto.subtle.sign(
        {
            name: "ECDSA",
            hash: {name: "SHA-256"},
        },
        privateKey,
        encoded
    );
    return {signature};
}
export const SignManager = {
    signMessage, getMessageEncoding
}