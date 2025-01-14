import '../styles/globals.css';
import 'react-phone-input-2/lib/style.css';
import { SessionProvider } from 'next-auth/react';
import Head from 'next/head'

import { Toaster } from 'sonner';

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <>
      <Head>
        <title>Wazend</title>
      </Head>
      <SessionProvider session={session}>
        <ProgressBar
          height="4px"
          color="#059669"
          options={{ showSpinner: false }}
          shallowRouting
        />
        <Toaster closeButton richColors position="top-right" />
        <Component {...pageProps} />
      </SessionProvider>
    </>
  );
}

export default MyApp;
