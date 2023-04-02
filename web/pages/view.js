import {useEffect, useState} from "react";
import {baseRoute, EncryptionManager, exportRSAKey, importRSAKey, KeyManager} from "../utils/encryption";
import {Breadcrumbs, Button, Card, Grid, Link, Text} from "@geist-ui/core";
// import {SignManager} from "../utils/sign-verify/rsa-pss";
// const forge = require("node-forge");
import TimeAgo from 'timeago-react'; // var TimeAgo = require('timeago-react');

export const getServerSideProps = async () => {

    return {
        props: {}
    }
}

export function _base64ToArrayBuffer(base64) {
    var binary_string = atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
}

const View = () => {
    const [updater, setUpdater] = useState(0);
    const [cursors, setCursors] = useState([]);
    const [state, setState] = useState({})
    const fetchMessages = async (cursor) => {
        const keyManager = await KeyManager();
        // const exported = await exportRSAKey(keyManager.key.publicKey)
        // console.log(exported, await importRSAKey(exported))
        // console.log(await exportRSAKey(keyManager.key.publicKey), (await keyManager.signature.loadSignature())['[Int8Array]'])
        // console.log(await new TextDecoder().decode(await keyManager.id.getId())))
        // const {signature} = await SignManager.signMessage(keyManager.key.privateKey, new TextDecoder().decode(await keyManager.id.getId()));
        // const id = await keyManager.id.getId();
        // const signature = await keyManager.signature.loadSignature();
        // console.log(signature)
        // const encodedSignature = await EncryptionManager.utils.ArrayBufferToBase64URI(signature);
        // const decodedSignature = await _base64ToArrayBuffer(decodeURIComponent(encodedSignature));
        // const veri = await SignManager.verifyMessage(keyManager.key.publicKey, decodedSignature, new TextDecoder().decode(id));
        // console.log(new TextDecoder().decode(id), veri);

        const signature = await keyManager.signature.loadSignature();
        console.log(signature)

        // const compressedSig = [...((signature))].join(".");
        // console.log(compressedSig, new TextDecoder().decode(signature), new TextDecoder().decode(new Uint8ClampedArray(compressedSig.split("."))))
        const encodedSignature = await EncryptionManager.utils.ArrayBufferToBase64URI(signature);
        console.log(signature, await EncryptionManager.utils.ArrayBufferToBase64URI(signature), new Float64Array(signature).join())
        const response = await fetch(baseRoute + "/get-messages", {
            method: "post",
            body: JSON.stringify({
                // publicKey: await exportRSAKey(keyManager.key.publicKey),
                signature: encodedSignature,
                // id: new TextDecoder().decode(await keyManager.id.getId()),
                cursor
            })
        });
        const data = await response.json();
        setState(data);
        setCursors([...cursors, data.cursor]);
    }
    useEffect(() => {
        fetchMessages()
    }, [updater]);
    return <div>
        <Card style={{
            display: "inline-flex",
            position: "fixed",
            top: "0",
            width: "100vw",
            left: "0",
            right: "0",
            justifyContent: "space-around"
        }}>
            <Grid.Container gap={2} justify="center">
                <Grid xs={12} md={12}><Link href={"/"}><Button>Home</Button></Link></Grid>
                <Grid xs={12} md={12}><Link href={"/view"}><Button>Inbox</Button></Link></Grid>
            </Grid.Container>
        </Card>
        <Grid.Container style={{padding: "1rem", marginTop: "3rem"}} gap={2} justify="center">
            <Grid xs={24}><Text h1>Inbox</Text></Grid>
            {state.chats ? state.chats.map(chat => {
                const chat_decoded = JSON.parse(chat.data);
                // const message_decoded = atob(chat_decoded.message_btoa);
                return <Grid key={chat.index.name} xs={24}>
                    <Card width="100%" style={{
                        overflowWrap: "break-word"
                    }}>{chat_decoded.message}
                        <TimeAgo datetime={new Date(chat_decoded.date).toTimeString()}/>
                    </Card>
                </Grid>
            }) : null}
        </Grid.Container>
        <div>{cursors.length >= 2 && <div>Previous</div>}{!state.list_complete && <div onClick={() => {
            fetchMessages(cursors[cursors.length -1]);
        }}>Next</div>}</div>
    </div>;
}
export default View