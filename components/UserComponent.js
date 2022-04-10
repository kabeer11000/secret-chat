import styles from "../styles/Home.module.css";
import {Breadcrumbs, Button, Card, Grid, Input, Link, Modal, Text, useClickAway, useModal} from "@geist-ui/core";
import {useEffect, useState} from "react";
import {EncryptionManager, KeyManager} from "../utils/encryption";
import {generate, SignManager} from '../utils/sign-verify/rsa-pss'
import {get, set} from "idb-keyval";
import StorageIndex from "../utils/indexes";
import { Copy } from '@geist-ui/icons'

const SignUpPage = ({keyExists}) => {
    const [state, setState] = useState([null, false, null]);
    const [user, userExists] = useState(false);

    //text,loading,
    // const ipfs = useContext(IPFSContext);

    const { visible, setVisible, bindings } = useModal()
    const CreateUser = async () => {

        setState([state[0], true]);
        // const id = crypto.randomUUID();
        const keyManager = await KeyManager();
        // const id = EncryptionManager.utils.getRandomValues();
        // await set(StorageIndex.SESSION_ID, id);
        // const {signature} = await SignManager.signMessage(keyManager.key.privateKey, id);
        // await set(StorageIndex.SESSION_SIGNATURE, signature);
        const signature = await keyManager.signature.loadSignature();
        const url = `${window.location.protocol}://${window.location.host}/send/?id=${await EncryptionManager.utils.ArrayBufferToBase64URI(signature)}`;
        console.log(url);
        setVisible(true);
        // userExists(true)
        setState([state[0], state[1], url]);
        userExists(signature)
        // window.localStorage.setItem("__kn.secretchat.auth.keys.public", await crypto.subtle.exportKey('raw', keyPair.publicKey))
        // document.addEventListener('DOMContentLoaded', async () => {
        //     const node = await Ipfs.create()
        //     const results = await node.add('=^.^= meow meow')
        //     const cid = results[0].hash
        //     console.log('CID created via ipfs.add:', cid)
        //     const data = await node.cat(cid)
        //     console.log('Data read back via ipfs.cat:', new TextDecoder().decode(data))
        // })
        // console.log(await window.Ipfs.create());
    }
    useEffect(() => {
        // generate()
        get(StorageIndex.SESSION_SIGNATURE).then(s => userExists(!!s));
    }, [])

    return (
        <div>
            <Card style={{
                display: "inline-flex",
                position: "fixed",
                top: "0",
                width: "100vw",
                left: "0",
                right:"0",
                justifyContent: "space-around"
            }}>
                <Grid.Container gap={2} justify="center">
                    <Grid xs={12} md={12}><Link><Button>Home</Button></Link></Grid>
                    <Grid xs={12} md={12}><Link href={"/view"}><Button>Inbox</Button></Link></Grid>
                </Grid.Container>
            </Card>
            <Modal width={"90%"} {...bindings}>
                <Modal.Title>{user ? "View Secret Chat URL":"Secret URL is Ready"}</Modal.Title>
                {/*<Modal.Subtitle>This is a modal</Modal.Subtitle>*/}
                <Modal.Content>
                    <p>Your Secret Chat URL: <br/>
                        <div style={{
                            display: "inline-flex"
                        }}><Input onClick={(e) => e.target.select} readOnly value={state[2]}/> <Button onClick={async () => {
                        await navigator.clipboard.writeText(state[2])
                    }}><Copy/></Button></div></p>
                    <p>Share this url with your friends!</p>
                </Modal.Content>
                <Modal.Action passive onClick={() => setVisible(false)}>Close</Modal.Action>
                <Modal.Action><Link href={"/view"}>View Messages</Link></Modal.Action>
            </Modal>
            <h1 className={styles.title}>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                Welcome to <a href="/">Secret Chat</a>
            </h1>
            <div className={"new-user"}>
            <p className={styles.description}>
                {/*{user ? "" :"Get started by typing your name below"}*/}
            </p>
            <Grid.Container gap={2} justify="center">
                <Grid xs={24} md={12}>
                    <Button onClick={CreateUser} width={"100%"} loading={state[1]}>{user ? "View URL" : "Create User"}</Button>
                </Grid>
            </Grid.Container>
            </div>
            <Text style={{
                display: "inline-flex",
                width: "100%",
                justifyContent: "center",
                bottom: "0",
                position: "fixed"
            }} small>Made By Kabeer @ChesticleHunter</Text>
        </div>
    )
}
const ChatViewerPage = () => {
    const [state, setState] = useState([[]])
    return (state[0].length) ? state[0].map((message, index) => (<div key={index}>
        <Grid.Container gap={2} justify="center">
            <Grid xs><Card width="100%" height="100%" />{message}</Grid>
        </Grid.Container>
    </div>)) : ("Loading")
}
export const UserComponent = () => {
    const [keyExists, setKeyExists] = useState(false);
    useEffect(() => {
        KeyManager().then(manager => setKeyExists(!!manager.key));
    }, [])
    return <SignUpPage keyExists={keyExists}/>;
    return keyExists ? <ChatViewerPage/> : <SignUpPage/>
}