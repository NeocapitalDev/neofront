import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/router';
import Recaptcha from '../../components/Recaptcha';  // Importar el componente de Recaptcha

import Layout from '../../components/layout/auth';

import { getSession } from 'next-auth/react';

const strapiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function ForgotPassword() {
  const [captchaToken, setCaptchaToken] = useState('');

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para controlar el envío del formulario
  const router = useRouter();
  const handleCaptcha = (token) => {
    console.log("Token del CAPTCHA:", token);  // Verificar el token
    setCaptchaToken(token);  // Guardar el token del CAPTCHA
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captchaToken) {
      toast.error('Por favor, completa el CAPTCHA.');
      return;
    }
    try {
      // Habilitar el estado de envío
      setIsSubmitting(true);

      const response = await fetch(`${strapiUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage('Se ha enviado un enlace de restablecimiento de contraseña a tu correo electrónico.');
        toast.success('Se envió un correo electrónico para restablecer la contraseña.');

        // Redirigir al usuario a la página de inicio después de un envío exitoso
        router.replace('/login');
      } else {
        const errorData = await response.json();
        setMessage(errorData.message);
      }
    } catch (error) {
      setMessage('Hubo un error al procesar tu solicitud.');
      toast.error('Ha ocurrido un error.');
      console.error(error);
    } finally {
      // Deshabilitar el estado de envío después de que se complete la solicitud (exitosa o fallida)
      setIsSubmitting(false);
    }
  };

  return (
    <Layout className=" min-h-screen">
      <h2 className="mt-6 text-2xl font-bold leading-9 tracking-tight text-black dark:text-white">
        Recuperar contraseña
      </h2>

      <p className="mt-2 text-sm leading-6 text-black dark:text-gray-400">
        Escribe tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      <div className="mt-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-zinc-800 dark:text-gray-300">
              Correo electrónico
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@ejemplo.com"
                required
                className="block w-full rounded-md border-0 py-1.5  dark:bg-gray-800 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-300 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          {/* Componente Turnstile */}
          <Recaptcha onVerify={handleCaptcha} />

          <div>
            <button
              type="submit"
              className={`dark:text-white text-zinc-900 flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 ${isSubmitting ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed" : "bg-amber-500 hover:bg-amber-600 dark:hover:bg-amber-400 focus:ring-amber-400"}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar correo de reinicio'}
            </button>
          </div>
        </form>

        <p className="mt-10 text-sm text-center leading-6 text-black dark:text-gray-400">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="font-semibold leading-6 text-amber-500 hover:text-amber-400 dark:text-amber-400 dark:hover:text-amber-300">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </Layout>

  );
};

export const getServerSideProps = async (context) => {
  const session = await getSession(context);
  // Check if session exists or not, if not, redirect
  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  return {
    props: {},
  };
};
