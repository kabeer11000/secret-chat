import Document, {Html, Head, Main, NextScript} from "next/document";
import {CssBaseline} from '@geist-ui/core'
// import {IPFSProvider} from "../contexts";

class MyDocument extends Document {
    static async getInitialProps(ctx) {
        const initialProps = await Document.getInitialProps(ctx);
        const styles = CssBaseline.flush();

        return {
            ...initialProps, styles: (<>
                {initialProps.styles}
                {styles}
            </>),
        };
    }

    render() {
        return (<Html>
            <Head/>
            <body>
            {/*<IPFSProvider>*/}
                <Main/>
                <NextScript/>
            {/*</IPFSProvider>*/}
            <script async src="https://cdn.jsdelivr.net/npm/ipfs/dist/index.min.js"/>
            </body>
        </Html>);
    }
}

export default MyDocument;
