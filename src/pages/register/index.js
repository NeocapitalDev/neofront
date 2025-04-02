import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { signIn } from "next-auth/react";

import Layout from '../../components/layout/auth';
import { PhoneInput } from '@/components/phone-input';

const strapiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function SignUp() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [passwordConditions, setPasswordConditions] = useState({
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
    length: false
  });
  const [showPasswordConditions, setShowPasswordConditions] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'password') {
      validatePasswordConditions(value);
    }
  };

  const generateUsername = (email) => {
    return email.replace(/[^a-zA-Z0-9]/g, '');
  };

  const validatePasswordConditions = (password) => {
    const conditions = {
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*]/.test(password),
      length: password.length >= 6
    };

    setPasswordConditions(conditions);
  };

  const isPasswordValid = () => {
    return Object.values(passwordConditions).every(condition => condition);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    try {
      await signIn('google', { callbackUrl: router.query.callbackUrl || '/' });
      // No necesitamos manejar el éxito aquí porque NextAuth redirigirá automáticamente
    } catch (error) {
      toast.error('Error al iniciar sesión con Google');
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const username = generateUsername(formData.email);
      const response = await axios.post(`${strapiUrl}/api/auth/local/register`, {
        username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      },
        {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
      toast.success('Registro exitoso.');
      router.replace('/email-confirmation');
    } catch (error) {
      console.error('Registration failed:', error);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error.message || 'Ha ocurrido un error.');
      } else {
        toast.error('Ha ocurrido un error al procesar su solicitud.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordFocus = () => {
    setShowPasswordConditions(true);
  };

  return (
    <Layout className="bg-zinc-200 min-h-screen">
      <div className="max-w-md mx-auto">
        {/* Título */}
        <h2 className="text-2xl font-semibold text-center text-white mb-6">Crea una cuenta nueva</h2>

        <div className="mt-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
   

          {process.env.NEXT_PUBLIC_ISACTIVELOGINGOOGLE === "true" && (

<div>            <div className="flex justify-center">
  <button
    type="button"
    onClick={() => signIn('google', { callbackUrl: router.query.callbackUrl || '/' })}
    className="flex items-center justify-center gap-2 w-full border border-gray-300 dark:border-gray-600 bg-gray-800 text-white px-4 py-2.5 rounded-md shadow-sm hover:bg-gray-900 transition-colors duration-300"
  >
    {/* Logo de Google en blanco */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="white"
    >
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
    <span className="text-sm text-white font-medium">Continuar con Google</span>
  </button>
</div>


  {/* Separador */}
  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-gray-700"></div>
    </div>
    <div className="relative flex justify-center">
      <span className="bg-zinc-800 rounded-full px-3 text-sm text-gray-400">o</span>
    </div>
  </div>
</div>



)}


            {/* Nombre */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-300">Nombre</label>
              <div className="mt-2">
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Tu nombre"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-700 bg-transparent text-white placeholder-gray-500 p-3 focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)] focus:border-[var(--app-primary)] transition"
                />
              </div>
            </div>

            {/* Apellido */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">Apellido</label>
              <div className="mt-2">
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Tu apellido"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-700 bg-transparent text-white placeholder-gray-500 p-3 focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)] focus:border-[var(--app-primary)] transition"
                />
              </div>
            </div>

            {/* Telefono */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300">Teléfono</label>
              <div className="mt-2">
                <PhoneInput
                  value={formData.phone}
                  onChange={(value) => setFormData({ ...formData, phone: value })}
                  defaultCountry="US"
                />
              </div>
            </div>

            {/* Correo Electrónico */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">Correo electrónico</label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@ejemplo.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-700 bg-transparent text-white placeholder-gray-500 p-3 focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)] focus:border-[var(--app-primary)] transition"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">Contraseña</label>
              <div className="mt-2 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={handlePasswordFocus}
                  className="w-full rounded-md border border-gray-700 bg-transparent text-white placeholder-gray-500 p-3 focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)] focus:border-[var(--app-primary)] transition"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-300 transition"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" aria-hidden="true" /> : <EyeIcon className="h-5 w-5" aria-hidden="true" />}
                </button>
              </div>
            </div>

            {/* Condiciones de contraseña */}
            {showPasswordConditions && (
              <div className="text-sm text-gray-400">
                <ul>
                  {[
                    { condition: passwordConditions.uppercase, label: "Una letra mayúscula" },
                    { condition: passwordConditions.lowercase, label: "Una letra minúscula" },
                    { condition: passwordConditions.number, label: "Un número" },
                    { condition: passwordConditions.specialChar, label: "Un carácter especial" },
                    { condition: passwordConditions.length, label: "6 caracteres o más" },
                  ].map(({ condition, label }, index) => (
                    <li key={index} className={condition ? "text-[var(--app-primary)]" : "text-gray-500"}>
                      <div className="inline-flex items-center">
                        <CheckCircleIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                        {label}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Botón de Registro */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting || !isPasswordValid()}
                className={`w-full rounded-md p-3 text-sm font-semibold transition ${isSubmitting || !isPasswordValid()
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-[var(--app-primary)] text-black hover:bg-[var(--app-secondary)] focus:ring-2 focus:ring-[var(--app-primary)]"
                  }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registrando...
                  </span>
                ) : (
                  "Regístrate"
                )}
              </button>
            </div>
          </form>

          {/* Enlace para iniciar sesión */}
          <p className="mt-6 text-sm text-center text-gray-400">
            ¿Tienes una cuenta?{" "}
            <Link href="/login" className="font-semibold text-[var(--app-primary)] hover:text-[var(--app-secondary)] transition">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps = async (context) => {
  const session = await getSession(context);
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