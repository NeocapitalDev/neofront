import { useEffect, useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import useSWR from 'swr';
import Link from 'next/link';
import NoOrders from './NoOrders';
import OrderSkeleton from './OrderSkeleton';
import {
  UserCircleIcon,
  ChatBubbleOvalLeftIcon,
  Cog6ToothIcon,
  EyeIcon,
  EyeSlashIcon,
  ClipboardIcon,
} from '@heroicons/react/24/outline';


import { toast } from 'sonner';

const strapiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const UserSubscription = () => {
  const { data: session, status } = useSession();
  const [jwt, setJwt] = useState(null);

  const [visibleKeys, setVisibleKeys] = useState({});
  const [instanceData, setInstanceData] = useState({}); // Almacena los datos de fetchInstances

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
      //console.log('Datos obtenidos de Strapi:', data); // Imprimir los datos de Strapi
      return data;
    } catch (error) {
      console.error('Error al realizar el fetch:', error);
      return null;
    }
  };

  const fetchInstanceData = async (instanceId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_WAZEND_API_URL}/instance/fetchInstances?instanceId=${instanceId}`,
        {
          headers: {
            apiKey: `${process.env.NEXT_PUBLIC_WAZEND_API_KEY}`, // Incluye el encabezado apiKey
          },
        }
      );

      if (!response.ok) {
        console.error(`Error al obtener datos de la instancia: ${instanceId}`);
        return null;
      }

      const data = await response.json();
      console.log(`Datos obtenidos de Wazend para ${instanceId}:`, data); // Imprimir los datos obtenidos
      return data;
    } catch (error) {
      console.error(`Error al realizar la solicitud para ${instanceId}:`, error);
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

  useEffect(() => {
    if (data?.subscriptions) {
      data.subscriptions.forEach(async (subscription) => {
        const { instanceId } = subscription;

        // Verificar si instanceId es válido antes de realizar la solicitud
        if (instanceId && !instanceData[instanceId]) {
          const instanceInfo = await fetchInstanceData(instanceId);
          if (instanceInfo && instanceInfo.length > 0) {
            setInstanceData((prev) => ({
              ...prev,
              [instanceId]: instanceInfo[0], // Solo el primer objeto
            }));
          }
        }
      });
    }
  }, [data]);

  if (status === 'loading' || isLoading || error || !data || !data.subscriptions) return <OrderSkeleton />;
  if (data.subscriptions.length === 0) return <NoOrders />;


  const filteredSubscriptions = data.subscriptions.filter(
    (subscription) => subscription.type === 'API'
  );

  //if (filteredSubscriptions.length === 0) return <NoOrders />;
  if (filteredSubscriptions.length === 0) return <p>No hay suscripciones de tipo API.</p>;

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
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filteredSubscriptions.map((subscription) => {
        const instanceInfo = instanceData[subscription.instanceId] || {};

        return (
          <li
            key={subscription.id}
            className="flex flex-col bg-white rounded-xl p-6 shadow-lg gap-4"
          >


            <div className="flex justify-between items-center mb-2">
              <p className="text-lg font-bold">{subscription.instanceName}</p>
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

            {/* Información adicional de la instancia */}
            {/* {instanceInfo.ownerJid && (
                <div className="bg-blue-100 p-3 rounded-sm">
                  <p className="text-sm font-semibold text-blue-800">
                    Propietario: {instanceInfo.ownerJid}
                  </p>
                </div>
              )} */}

            {/* API Key con íconos de ojo y copiar */}
            <div className="bg-gray-200 p-3 rounded-sm flex items-center justify-between">
              <p className="text-black text-sm font-mono">
                {visibleKeys[subscription.id]
                  ? subscription.apiKey
                  : '********-****-****-****-************'}
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
                  onClick={() => copyToClipboard(subscription.apiKey)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ClipboardIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="mt-6 group block flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div>
                    <img
                      className="inline-block h-10 w-10 rounded-full bg-gray-200"
                      src={instanceInfo.profilePicUrl || "/images/WAPP.webp"}
                      alt="WhatsApp"
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-md font-semibold text-black">{instanceInfo.profileName || "Cargando..."}</p>
                    <p className="text-sm font-base text-gray-500">
                      {instanceInfo.ownerJid ? instanceInfo.ownerJid.split('@')[0] : "Cargando..."}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <div className="flex flex-col items-center">
                    <UserCircleIcon className="h-6 w-6 text-gray-600" />
                    <p className="text-sm font-base text-gray-600">
                      {instanceInfo._count?.Contact || 0}
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <ChatBubbleOvalLeftIcon className="h-6 w-6 text-gray-600" />
                    <p className="text-sm font-base text-gray-600">
                      {instanceInfo._count?.Message || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">

              <p
                className={`text-sm font-semibold px-3 py-1 rounded-2xl text-white ${instanceInfo.connectionStatus === "open"
                  ? "bg-green-600"
                  : instanceInfo.connectionStatus === "connecting"
                    ? "bg-orange-500"
                    : instanceInfo.connectionStatus === "close"
                      ? "bg-red-600"
                      : "bg-gray-600"
                  }`}
              >
                {instanceInfo.connectionStatus || "Cargando..."}
              </p>


              <div>
                {new Date(subscription.endDate) >= new Date() ? (
                  <Link href={`/instances/${subscription.instanceId}`} passHref>
                    <button
                      className="hover:shadow-lg transition-shadow duration-300 border border-gray-200 bg-white text-slate-900 px-6 py-2 rounded-lg text-base font-semibold shadow-md flex items-center justify-center space-x-2"
                    >
                      <Cog6ToothIcon className="h-6 w-6" />
                      <span>Ajustes</span>
                    </button>
                  </Link>
                ) : (
                  <span className="text-base font-semibold bg-red-500 text-white px-6 py-2 rounded-lg">Cancelado</span>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default UserSubscription;