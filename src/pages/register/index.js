import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

import Layout from '../../components/layout/auth';
import {PhoneInput} from '@/components/phone-input';


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

  const handleSubmit = async (e) => {
    // alert(formData.phone);

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
      console.log('Registration successful:', response.data);
      toast.success('Registro exitoso.');
      router.replace('/email-confirmation');
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Ha ocurrido un error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordFocus = () => {
    setShowPasswordConditions(true);
  };

  return (
    <>
      <Layout className="bg-zinc-200 min-h-screen">
        <div className="max-w-md mx-auto">
          {/* Título */}
          <h2 className="text-xl font-semibold text-left text-white">🎉 Crea una cuenta nueva</h2>

          <div className="mt-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">Telefono</label>
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
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647zM20 12a8 8 0 01-8 8v4c6.627 0 12-5.373 12-12h-4zm-2-7.291A7.962 7.962 0 0120 12h4c0-3.042-1.135-5.824-3-7.938l-3 2.647z"></path>
                      </svg>
                      Registrando...
                    </>
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


    </>
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
