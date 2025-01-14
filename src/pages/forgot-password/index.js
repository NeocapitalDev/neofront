import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/router';

import Layout from '../../components/layout/auth';

import { getSession } from 'next-auth/react';

const strapiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para controlar el envío del formulario
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Habilitar el estado de envío
      setIsSubmitting(true);

      const response = await fetch(`${strapiUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
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
    <Layout className="bg-black min-h-screen">
      <h2 className="mt-6 text-2xl font-bold leading-9 tracking-tight text-white">
        Recuperar contraseña
      </h2>

      <p className="mt-2 text-sm leading-6 text-gray-400">
        Escribe tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      <div className="mt-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-300">
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
                className="block w-full rounded-md border-0 py-1.5 bg-gray-800 text-gray-300 shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={`text-black flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${isSubmitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400 focus:ring-amber-400'
                }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar correo de reinicio'}
            </button>
          </div>
        </form>

        <p className="mt-10 text-sm text-center leading-6 text-gray-400">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="font-semibold leading-6 text-amber-400 hover:text-amber-300">
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
