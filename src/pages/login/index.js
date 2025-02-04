import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { signIn } from "next-auth/react";
import { getSession } from 'next-auth/react';
import Layout from '../../components/layout/auth';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Recaptcha from '@/components/Recaptcha';

export default function SignIn() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");

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
  <Layout className="min-h-screen bg-white dark:bg-black">
    <h2 className="mt-6 text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
      Iniciar sesión 👋
    </h2>

    <div className="mt-8">
      <form className="space-y-6" onSubmit={onSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium leading-6 text-zinc-800 dark:text-gray-300">
            Correo electrónico
          </label>
          <div className="mt-2">
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="tu@ejemplo.com"
              required
              className="block w-full rounded-md border-0 py-1.5 dark:bg-gray-800 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 dark:focus:ring-amber-500 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-zinc-800 dark:text-gray-300">
              Contraseña
            </label>
            <div className="text-sm">
              <Link href="/forgot-password" className="leading-6 text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300">
                ¿Has olvidado tu contraseña?
              </Link>
            </div>
          </div>
          <div className="mt-2 relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              className="block w-full rounded-md border-0 py-1.5 dark:bg-gray-800 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 dark:focus:ring-amber-500 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm sm:leading-6"
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

        <Recaptcha onVerify={setCaptchaToken} />

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`dark:text-black text-zinc-900 flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 ${
              isSubmitting
                ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                : "bg-amber-500 hover:bg-amber-600 dark:hover:bg-amber-400 focus:ring-amber-400"
            }`}
          >
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </button>
        </div>
      </form>

{/* 
      <p className="mt-10 text-sm text-center leading-6 text-zinc-900 font-medium dark:text-gray-400">
    ¿No tienes una cuenta?{" "}
    <Link href="/register" className="font-semibold leading-6 text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300">
      Regístrate ahora
    </Link>
  </p> */}

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