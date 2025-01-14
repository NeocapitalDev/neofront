import { useEffect, useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import useSWR, { mutate } from 'swr';
import NoOrders from '../../components/NoOrders';
import OrderSkeleton from '../../components/OrderSkeleton';
import Link from 'next/link';
import { ArrowRightCircleIcon, EyeIcon, EyeSlashIcon, ClipboardIcon } from '@heroicons/react/24/outline';

import { toast } from 'sonner';

const strapiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const UserSubscription = () => {
  const { data: session, status } = useSession();
  const [jwt, setJwt] = useState(null);

  const [visibleKeys, setVisibleKeys] = useState({});

  const fetcher = async (url) => {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (!response.ok) {
        console.error('Error al obtener los datos:', response.statusText);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al realizar el fetch:', error);
      return null;
    }
  };

  useEffect(() => {
    const getToken = async () => {
      const session = await getSession();
      if (session) {
        setJwt(session.jwt);
      }
    };

    getToken();
  }, []);

  const { data, error, isLoading } = useSWR(
    jwt ? `${strapiUrl}/api/users/me?populate=subscriptions` : null,
    fetcher
  );

  if (status === 'loading' || isLoading || error || !data || !data.subscriptions) return <OrderSkeleton />;

  // Filtrar las suscripciones de tipo "API"
  const filteredSubscriptions = data.subscriptions.filter(
    (subscription) => subscription.type !== 'API'
  );

  if (filteredSubscriptions.length === 0) return <NoOrders />;


  const toggleKeyVisibility = (id) => {
    setVisibleKeys((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyToClipboard = (key) => {
    if (key) {
      navigator.clipboard.writeText(key);
      toast.success('Copiado exitosamente.');
    }
  };

  return (
    <div>
      <ul className="space-y-4">
        {filteredSubscriptions.map((subscription) => (
          <li
            key={subscription.id}
            className="flex flex-col bg-white rounded-xl p-6 shadow-lg gap-4"
          >


            {/* Titulo y fecha */}
            <div className="flex justify-between items-center mb-2">
              <p className="text-lg font-bold">Wazend {subscription.type} (#{subscription.id})</p>
              <div className="bg-green-200 px-2 py-1 rounded-sm inline-block">
                <p className="text-green-700 text-xs">
                  Expira el{' '}
                  {new Date(subscription.endDate).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>


            <p className="text-base font-semibold">Credenciales de acceso:</p>

            {/* API Key con íconos de ojo y copiar */}
            <div className="bg-gray-200 p-3 rounded-sm flex items-center justify-between">
              <p className="text-black text-sm font-mono">{subscription.email}</p>
              <div className="flex space-x-4">
                <button
                  onClick={() => copyToClipboard(subscription.email)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ClipboardIcon className="h-5 w-5" />
                </button>
              </div>
            </div>


            {/* Contraseña con íconos de ojo y copiar */}
            <div className="bg-gray-200 p-3 rounded-sm flex items-center justify-between">
              <p className="text-black text-sm font-mono">
                {visibleKeys[subscription.id]
                  ? subscription.password
                  : '********'}
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => toggleKeyVisibility(subscription.id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {visibleKeys[subscription.id] ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={() => copyToClipboard(subscription.password)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ClipboardIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Botón de acción */}
            <div className="mt-4 flex justify-end space-x-4">
              {new Date(subscription.endDate) >= new Date() ? (
                <Link href={`${subscription.url}`} passHref target='_blank'>
                  <button
                    className="hover:shadow-lg transition-shadow duration-300 border border-gray-200 bg-white text-slate-900 px-6 py-2 rounded-lg text-base font-semibold shadow-md w-full md:w-auto flex items-center justify-center space-x-2"
                  >
                    <ArrowRightCircleIcon className="h-6 w-6" />
                    <span>Acceder</span>
                  </button>
                </Link>
              ) : (
                <span className="text-base font-semibold bg-red-500 text-white px-6 py-2 rounded-lg">Cancelado</span>
              )}
            </div>


          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserSubscription;