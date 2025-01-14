import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

import Layout from '../../components/layout/auth';

const strapiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function SignUp() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const username = generateUsername(formData.email);
      const response = await axios.post(`${strapiUrl}/api/auth/local/register`, {
        username,
        email: formData.email,
        password: formData.password
      });
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
      <Layout>

        <h2 className="mt-6 text-2xl font-bold leading-9 tracking-tight text-gray-900">
          🎉 Crea una cuenta nueva
        </h2>

        <div className="mt-8">
          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* Email */}
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
                  placeholder="tu@ejemplo.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                Contraseña
              </label>
              <div className="mt-2 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={handlePasswordFocus}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 focus:outline-none"
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

            {/* Condiciones de contraseña */}
            <div className="text-sm text-gray-500">
              {showPasswordConditions && (
                <ul>
                  <li className={`${passwordConditions.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                    <div className='inline-flex items-center'>
                      <CheckCircleIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                      Una letra mayúscula
                    </div>
                  </li>
                  <li className={`${passwordConditions.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                    <div className='inline-flex items-center'>
                      <CheckCircleIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                      Una letra minúscula
                    </div>
                  </li>
                  <li className={`${passwordConditions.number ? 'text-green-600' : 'text-gray-500'}`}>
                    <div className='inline-flex items-center'>
                      <CheckCircleIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                      Un número
                    </div>
                  </li>
                  <li className={`${passwordConditions.specialChar ? 'text-green-600' : 'text-gray-500'}`}>
                    <div className='inline-flex items-center'>
                      <CheckCircleIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                      Un carácter especial
                    </div>
                  </li>
                  <li className={`${passwordConditions.length ? 'text-green-600' : 'text-gray-500'}`}>
                    <div className='inline-flex items-center'>
                      <CheckCircleIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                      6 caracteres o más
                    </div>
                  </li>
                </ul>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting || !isPasswordValid()}
                className={`text-white w-full justify-center inline-flex items-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${isSubmitting || !isPasswordValid() ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-600'}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647zM20 12a8 8 0 01-8 8v4c6.627 0 12-5.373 12-12h-4zm-2-7.291A7.962 7.962 0 0120 12h4c0-3.042-1.135-5.824-3-7.938l-3 2.647z"></path>
                    </svg>
                    Regístrate
                  </>
                ) : (
                  'Regístrate'
                )}
              </button>
            </div>
          </form>

          <p className="mt-10 text-sm text-center leading-6 text-gray-500">
            ¿Tienes una cuenta?{' '}
            <Link href="/login" className="font-semibold leading-6 text-emerald-600 hover:text-emerald-500">
              Iniciar sesión
            </Link>
          </p>
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
