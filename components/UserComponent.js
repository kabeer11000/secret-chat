import styles from "../styles/Home.module.css";
import {Button, Card, Grid, Input} from "@geist-ui/core";
import {useEffect, useState} from "react";
import {EncryptionManager, KeyManager} from "../utils/encryption";
import {generate} from '../utils/sign-verify/rsa-pss'
const SignUpPage = () => {
    const [state, setState] = useState([null, false, null, false]);
    // const ipfs = useContext(IPFSContext);
    const CreateUser = async () => {

        setState([state[0], true]);
        const id = crypto.randomUUID();
        const keyManager = await KeyManager();
        const encrypted = await EncryptionManager.encryptMessage(keyManager.key, id);
        const url = `${window.location.protocol}://${window.location.host}/send/?id=${await EncryptionManager.utils.ArrayBufferToBase64URI(encrypted.ciphertext)}`;
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
        generate()
    }, [])
    return (
        <div>

            <h1 className={styles.title}>
                Welcome to <a href="https://nextjs.org">Secret Chat</a>
            </h1>

            <p className={styles.description}>
                Get started by typing your name below
            </p>
            <Grid.Container gap={2} justify="center">
                <Grid xs={24} md={12}>
                    <Card width="100%">
                        <Input onChange={async e => {
                            setState([e.target.value, false])
                        }} scale={4 / 3} value={state[0]} width="100%" placeholder="Anybodyxxx"/>
                    </Card>
                </Grid>

                <Grid xs={24} md={12}>
                    <Button onClick={CreateUser} loading={state[1]}>Continue</Button>
                </Grid>
            </Grid.Container>
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
    return keyExists ? <ChatViewerPage/> : <SignUpPage/>
}