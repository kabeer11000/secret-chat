import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import {Text, Input, Grid, Card, Button} from "@geist-ui/core";
import {useContext, useState} from "react";
import {Utf8ArrayToStr} from "../utils/utils";
import {EncryptionManager, KeyManager} from "../utils/encryption";
// import {IPF¬SContext} from "../contexts";
import {UserComponent} from "../components/UserComponent";

export default function Home() {
    return (
        <div className={styles.container}>
            <Head>
                <title>Secret Chat - Kabeers Network</title>
                <meta name="description" content="Created with love by Kabeer"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <main className={styles.main}>
                <UserComponent/>
            </main>
        </div>
    )
}
