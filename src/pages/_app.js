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
        <title>{process.env.NEXT_PUBLIC_NAME_APP}</title>
      </Head>
      <SessionProvider session={session}>
        <ProgressBar
          height="4px"
          color="#ffb800"
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
