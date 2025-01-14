import { useRouter } from 'next/router';
import { useState } from 'react';
import axios from 'axios';
import Layout from '../../components/layout/auth';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline'

import { getSession } from 'next-auth/react';


const strapiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;


export default function ResetPassword() {
  const router = useRouter();
  const { code } = router.query;
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setpasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false); // Nuevo estado para controlar el estado de carga
  const [showPassword, setShowPassword] = useState(false); // Nuevo estado para controlar la visibilidad de la contraseña

  const handleResetPassword = async (event) => {
    event.preventDefault(); // Prevenir el comportamiento de envío predeterminado del formulario

    try {
      if (password !== passwordConfirmation) {
        toast.error('Las contraseñas no coinciden.');
        return;
      }

      setLoading(true); // Establecer el estado de carga como verdadero al iniciar la solicitud
      await axios.post(`${strapiUrl}/api/auth/reset-password`, { code, password, passwordConfirmation }); // Envía tanto password como confirmPassword
      setLoading(false); // Establecer el estado de carga como falso cuando la solicitud se completa
      toast.success('Contraseña restablecida con éxito.');
      router.replace('/login');
    } catch (error) {
      setLoading(false); // Establecer el estado de carga como falso si hay un error
      toast.error('Ha ocurrido un error.');
    }
  };

  return (

<Layout className="bg-black min-h-screen">
  <h2 className="mt-6 text-2xl font-bold leading-9 tracking-tight text-white">
    Restablecer contraseña
  </h2>

  <div className="mt-8">
    <form className="space-y-6" onSubmit={handleResetPassword}>
      <div>
        <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-300">
          Contraseña
        </label>
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
            className="block w-full rounded-md border-0 py-1.5 pr-10 bg-gray-800 text-gray-300 shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm sm:leading-6"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-300 focus:outline-none"
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
        <label htmlFor="confirm-password" className="block text-sm font-medium leading-6 text-gray-300">
          Confirmar contraseña
        </label>
        <div className="mt-2 relative">
          <input
            id="confirm-password"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={passwordConfirmation}
            onChange={(e) => setpasswordConfirmation(e.target.value)}
            minLength={6}
            required
            className="block w-full rounded-md border-0 py-1.5 pr-10 bg-gray-800 text-gray-300 shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm sm:leading-6"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-300 focus:outline-none"
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

      <button
        type="submit"
        disabled={loading}
        className={`text-black flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          loading
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-amber-500 hover:bg-amber-400 focus:ring-amber-400'
        }`}
      >
        {loading ? 'Cargando...' : 'Restablecer contraseña'}
      </button>
    </form>

    <p className="mt-10 text-sm text-center leading-6 text-gray-400">
      <Link href="/login" className="font-semibold leading-6 text-amber-400 hover:text-amber-300">
        Volver al inicio de sesión
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