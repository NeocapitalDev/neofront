import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/router';

import Layout from '../../components/layout/auth';

import { getSession } from 'next-auth/react';

const strapiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function ForgotPassword (){
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
    <Layout>
      <h2 className="mt-6 text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Recuperar contraseña
      </h2>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        Escribe tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      <div className="mt-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
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
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            {/* Deshabilitar el botón de envío mientras se está enviando el formulario */}
            <button
              type="submit"
              className={`text-white flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-600'}`}
              disabled={isSubmitting} // Deshabilitar el botón si se está enviando el formulario
            >
              {isSubmitting ? 'Enviando...' : 'Enviar correo de reinicio'}
            </button>
          </div>
        </form>

        <p className="mt-10 text-sm text-center leading-6 text-gray-500">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="font-semibold leading-6 text-emerald-600 hover:text-emerald-500">
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
