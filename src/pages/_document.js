import { Html, Head, Main, NextScript } from "next/document";


export default function Document() {
  return (
    <Html lang="es" className="h-full bg-zinc-900">
      <Head>
      <link href="https://rsms.me/inter/inter.css" rel="stylesheet"/>
      </Head>
      <body className="h-full">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
