import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

import OrderSkeleton from '../../components/OrderSkeleton';

import LogoGravatar from '../../components/LogoGravatar'

const strapiUrl = process.env.NEXT_PUBLIC_BACKEND_URL; // URL del backend desde las variables de entorno

export default function User() {
  const { data: session, status } = useSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (status === 'authenticated' && session?.jwt) {
          const response = await fetch(`${strapiUrl}/api/users/me`, {
            headers: {
              Authorization: `Bearer ${session.jwt}`, // JWT de la sesión
            },
          });

          if (!response.ok) {
            throw new Error('Error al obtener datos');
          }

          const result = await response.json();
          setData(result); // Guarda los datos en el estado
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status, session]);

  if (status === 'loading' || loading) return <OrderSkeleton />;
  if (error) return <div>Error: {error}</div>;

  // Asegúrate de que `data` no sea nulo antes de renderizar
  if (!data) {
    return <OrderSkeleton />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg dark:bg-gray-900 dark:shadow-white">
      <div className="border-b pt-8 px-6">
        <div className="flex gap-8 justify-center">
          <button className="pb-4 px-1 border-b-2 border-emerald-600 text-emerald-600 font-bold">
            Cuenta
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center p-8">

        {/* <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-4">

          {data.image ? (
            <img
              src={data.image}
              alt={data.name || 'Usuario'}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-white text-4xl font-medium">
              {data.name
                ?.split(' ')
                .map((word) => word[0])
                .join('') || 'NN'}
            </span>
          )}
          
        </div> */}

        <LogoGravatar
          email={session.user.email || 'usuario@example.com'}
          className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4"
        />



        <h1 className="text-3xl font-bold text-slate-700 mb-2">{data.name || 'Nombre no disponible'}</h1>
        <p className="text-gray-400 text-sm mb-8">
          Fecha de creación: {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'No disponible'}
        </p>


        <div className="w-full space-y-6 bg-gray-100 p-6 rounded-lg dark:bg-gray-900">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              <label className="text-base font-semibold text-black">Username</label>
            </div>
            <div className="w-full md:w-3/4">
              <p className="text-gray-700">{data.username || 'Username no disponible'}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              <label className="text-base font-semibold text-black">Email</label>
            </div>
            <div className="w-full md:w-3/4">
              <p className="text-gray-700">{data.email || 'Correo no disponible'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}