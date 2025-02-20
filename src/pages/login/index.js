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
<div className="max-w-md mx-auto">
      {/* Título */}
      <h2 className="text-xl font-semibold text-left text-white">Iniciar sesión 👋</h2>

      <form className="space-y-6 mt-4" onSubmit={onSubmit}>
        {/* Campo de Correo Electrónico */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
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
              className="w-full rounded-md border border-gray-700 bg-transparent text-white placeholder-gray-500 p-3 focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)] focus:border-[var(--app-primary)] transition"
            />
          </div>
        </div>

        {/* Campo de Contraseña */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Contraseña
            </label>
            <Link href="/forgot-password" className="text-sm text-[var(--app-primary)] hover:text-[var(--app-secondary)] transition">
              ¿Has olvidado tu contraseña?
            </Link>
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
              className="w-full rounded-md border border-gray-700 bg-transparent text-white placeholder-gray-500 p-3 focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)] focus:border-[var(--app-primary)] transition"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-300 transition"
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

        {/* Captcha */}
        <Recaptcha onVerify={setCaptchaToken} />

        {/* Botón de Enviar */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full rounded-md p-3 text-sm font-semibold transition ${
              isSubmitting
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-[var(--app-primary)] text-black hover:bg-[var(--app-secondary)] focus:ring-2 focus:ring-[var(--app-primary)]"
            }`}
          >
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </button>
        </div>
      </form>

      {/* Enlace de Registro */}
      <p className="mt-6 text-sm text-center text-gray-400">
        ¿No tienes una cuenta?{" "}
        <Link href="/register" className="font-semibold text-[var(--app-primary)] hover:text-[var(--app-secondary)] transition">
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