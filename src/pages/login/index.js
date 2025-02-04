import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { signIn } from "next-auth/react";
import { getSession } from 'next-auth/react';
import Layout from '../../components/layout/auth';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function SignIn() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Controla el campo de contraseña

  const onSubmit = async (e) => {
    e.preventDefault();

    // Bloquear el botón de enviar
    setIsSubmitting(true);

    const result = await signIn('credentials', {
      redirect: false,
      email: e.target.email.value,
      password: e.target.password.value,
    });

    if (result.ok) {
      const callbackUrl = new URLSearchParams(window.location.search).get('callbackUrl');
      if (callbackUrl) {
        router.replace(callbackUrl);
      } else {
        router.replace('/');
      }
      toast.success('Sesión iniciada correctamente.');
    } else {
      toast.error('Credenciales incorrectas');
      // Desbloquear el botón de enviar en caso de error
      setIsSubmitting(false);
    }
    
  };

  return (
<Layout>
  <h2 className="mt-6 text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100">
    Iniciar sesión 👋
  </h2>

  <div className="mt-8">
    <form className="space-y-6" onSubmit={onSubmit}>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
        >
          Correo electrónico
        </label>
        <div className="mt-2">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@ejemplo.com"
            required
            className="block w-full rounded-md border-0 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
          >
            Contraseña
          </label>
          <div className="text-sm">
            <Link
              href="/forgot-password"
              className="font-normal text-emerald-600 hover:text-emerald-500 dark:hover:text-emerald-400"
            >
              ¿Has olvidado tu contraseña?
            </Link>
          </div>
        </div>
        <div className="mt-2 relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
                className="block w-full rounded-md border-0 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
                />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 text-black dark:text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <EyeIcon className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting} // Bloquear el botón de enviar mientras se envía el formulario
          className={`text-white w-full justify-center inline-flex items-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${
            isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-600'
          }`}
        >
          {isSubmitting ? (
                  <>
                    Ingresa
                  </>
                ) : (
                  'Ingresa'
                )}
        </button>
      </div>
    </form>

    <p className="mt-10 text-sm text-center leading-6 text-gray-500 dark:text-gray-400">
      ¿No tienes una cuenta?{' '}
      <Link
        href="/register"
        className="font-semibold leading-6 text-emerald-600 hover:text-emerald-500 dark:hover:text-emerald-400"
      >
        Regístrate ahora
      </Link>
    </p>
  </div>
</Layout>


  );
}

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