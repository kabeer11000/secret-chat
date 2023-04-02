let key = await window.crypto.subtle.generateKey(
    {
        name: "AES-GCM",
        length: 256
    },
    true,
    ["encrypt", "decrypt"]
);
const exported = await window.crypto.subtle.exportKey(
    "raw",
    key
);