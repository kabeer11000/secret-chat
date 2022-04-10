import {useEffect, useState} from "react";
import {Button, Card, Grid, Spacer, Text, Textarea, useInput} from "@geist-ui/core";
import {baseRoute} from "../utils/encryption";

const Send = () => {
    const [state, setState] = useState({
        // params: new URLSearchParams(window.location.search),
        loading: false
    });
    const { state: message, setState: setInputState, reset, bindings } = useInput('');
    useEffect(() => {
        setState({...state, params: new URLSearchParams(window.location.search)});
    }, []);
    return <div style={{
        margin: "1rem",
        display: "flex",
        justifyContent: "center",
        top: "50%",
        bottom: "50%"
    }}>
        <Card style={{
            maxWidth: "50rem"
        }} width="100%">
            <Grid.Container gap={1} justify="center">
                <Grid xs={24} md={12}>
                    <Text h2>Send A Secret Message to: </Text>
                </Grid>
                <Grid xs={24} md={12}>
                    <Text type={"secondary"} small style={{
                        width: "100%",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                    }}>{state?.params?.get("id")}</Text>
                </Grid>
                <Spacer h={5}/>
                <Grid xs={24} md={24}>
                    <Textarea style={{
                        minHeight: "10rem"
                    }} height={"100%"} placeholder={"Write Your Message Here"} width="100%" {...bindings}/>
                    {/*<Text h1>Send A Secret Message to: {state?.params.get("id")}</Text>*/}
                </Grid>
                <Grid xs={24} md={24}>
                    <Button onClick={async () => {
                        setState({...state, loading: true});
                        await fetch(baseRoute +"/send-message", {
                            method: "post",
                            body: JSON.stringify({
                                message: message,
                                id: state.params.get("id")
                            })
                        });
                        setState({...state, loading: false, success: true})
                    }} type={state.success ? "success" : "secondary"} width={"100%"}>{state.success? "Sent" : "Send"}</Button>
                </Grid>
            </Grid.Container>
        </Card>
    </div>;
}
export default Send