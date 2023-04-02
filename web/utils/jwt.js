var privateKey;
var publicKey;



var iv;


function asciiToUint8Array(str) {
    var chars = [];
    for (var i = 0; i < str.length; ++i)
        chars.push(str.charCodeAt(i));
    return new Uint8Array(chars);
}

function ECDSA_Sign() {

    var cryptoObj = window.crypto || window.msCrypto;

    if(!cryptoObj)
    {
        alert("Crypto API is not supported by the Browser");
        return;
    }

    var plainText = document.getElementById("plainText").value;
    var curve = document.getElementById("curve").value;

    window.crypto.subtle.generateKey({
            name: "ECDSA",
            namedCurve: curve, //can be "P-256", "P-384", or "P-521"
        },
        true, //whether the key is extractable (i.e. can be used in exportKey)
        ["sign", "verify"] //can be any combination of "sign" and "verify"
    )
        .then(function(key) {

            publicKey = key.publicKey;
            privateKey = key.privateKey;
            // For Demo Purpos Only Exported in JWK format
            window.crypto.subtle.exportKey("jwk", key.publicKey).then(
                function(keydata) {
                    publicKeyhold = keydata;
                    publicKeyJson = JSON.stringify(publicKeyhold);
                    document.getElementById("ecdsapublic").value = publicKeyJson;
                }
            );

            window.crypto.subtle.exportKey("jwk", key.privateKey).then(
                function(keydata) {
                    privateKeyhold = keydata;
                    privateKeyJson = JSON.stringify(privateKeyhold);
                    document.getElementById("ecdsaprivate").value = privateKeyJson;
                }
            );

            window.crypto.subtle.sign({
                    name: "ECDSA",
                    hash: {
                        name: "SHA-256"
                    }, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
                },
                privateKey, //from generateKey or importKey above
                asciiToUint8Array(plainText) //ArrayBuffer of data you want to sign
            )
                .then(function(signature) {
                    //returns an ArrayBuffer containing the signature
                    document.getElementById("cipherText").value = bytesToHexString(signature);
                })
                .catch(function(err) {
                    console.error(err);
                });


        })
        .catch(function(err) {
            console.error(err);
        });
}



function ECDSA_Verify() {

    var cryptoObj = window.crypto || window.msCrypto;

    if(!cryptoObj)
    {
        alert("Crypto API is not supported by the Browser");
        return;
    }

    var cipherText = document.getElementById("cipherText").value;
    var plainText = document.getElementById("plainText").value;

    if(!publicKey)
    {
        alert("Generate ECDSA Keys First")
        return;
    }

    window.crypto.subtle.verify({
            name: "ECDSA",
            hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
        },
        publicKey, //from generateKey or importKey above
        hexStringToUint8Array(cipherText), //ArrayBuffer of the data
        asciiToUint8Array(plainText)
    )
        .then(function(decrypted) {
            alert("Verified   " + decrypted);
        })
        .catch(function(err) {
            console.error(err);
        });

}

function bytesToASCIIString(bytes) {
    return String.fromCharCode.apply(null, new Uint8Array(bytes));
}

function bytesToHexString(bytes) {
    if (!bytes)
        return null;

    bytes = new Uint8Array(bytes);
    var hexBytes = [];

    for (var i = 0; i < bytes.length; ++i) {
        var byteString = bytes[i].toString(16);
        if (byteString.length < 2)
            byteString = "0" + byteString;
        hexBytes.push(byteString);
    }

    return hexBytes.join("");
}

function hexStringToUint8Array(hexString) {
    if (hexString.length % 2 != 0)
        throw "Invalid hexString";
    var arrayBuffer = new Uint8Array(hexString.length / 2);

    for (var i = 0; i < hexString.length; i += 2) {
        var byteValue = parseInt(hexString.substr(i, 2), 16);
        if (byteValue == NaN)
            throw "Invalid hexString";
        arrayBuffer[i / 2] = byteValue;
    }

    return arrayBuffer;
}


function failAndLog(error) {
    console.log(error);
}