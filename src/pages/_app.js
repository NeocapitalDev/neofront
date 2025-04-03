import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import Head from 'next/head';
import { Toaster } from 'sonner';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { ThemeProvider } from "../components/ui/theme-provider"; // Asegúrate de que la ruta sea correcta
import ChatwootWidget from '@/components/ChatWidget';
//import ModalRoullete from '@/components/roullete/ModalRoullete';
import { useEffect, useState } from 'react';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {



  const getHexFromCSSVar = (varName) => {
    const root = getComputedStyle(document.documentElement);
    let color = root.getPropertyValue(varName).trim();

    if (!color) return null;

    // Si el color está en formato HSL, convertirlo a RGB primero
    if (color.startsWith('hsl')) {
      color = hslToRgb(color);
    }

    // Si el color está en formato RGB, convertirlo a Hexadecimal
    if (color.startsWith('rgb')) {
      return rgbToHex(color);
    }

    return color; // Si ya es hexadecimal, devolverlo directamente
  };

  const rgbToHex = (rgb) => {
    const result = rgb.match(/\d+/g).map(Number);
    return `#${result.map((x) => x.toString(16).padStart(2, '0')).join('')}`;
  };

  const hslToRgb = (hsl) => {
    const [h, s, l] = hsl.match(/\d+(\.\d+)?/g).map(Number);
    const a = s / 100;
    const b = l / 100;
    const k = (n) => (n + h / 30) % 12;
    const c = a * Math.min(b, 1 - b);
    const f = (n) => b - c * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return `rgb(${Math.round(f(0) * 255)}, ${Math.round(f(8) * 255)}, ${Math.round(f(4) * 255)})`;
  };
  const [hexColor, setHexColor] = useState('');
  useEffect(() => {
    setHexColor(getHexFromCSSVar('--app-primary'));
  }, []);


  console.log(hexColor, 'hexColor')
  return (
    <>
      <Head>
        <title>{String(process.env.NEXT_PUBLIC_NAME_APP || "")}</title>
      </Head>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <SessionProvider session={session}>
          <ProgressBar
            height="4px"
            color="#f59e0b"

            options={{ showSpinner: false }}
            shallowRouting
          />
          <Toaster closeButton richColors position="top-right" />
          <Component {...pageProps} />
          {/* <ChatwootWidget /> */}
        </SessionProvider>

      </ThemeProvider>
    </>
  );
}

export default MyApp;
