import { useEffect, useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import useSWR from 'swr';
//import NoOrders from '../NoOrders';
import OrderSkeleton from '../OrderSkeleton';
import Link from 'next/link';
import {
  ArrowTopRightOnSquareIcon,
  ArrowRightCircleIcon,
  Cog6ToothIcon,
  EyeIcon,
  EyeSlashIcon,
  ClipboardIcon
} from '@heroicons/react/24/outline';

const strapiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

import NoInstances from './NoTrialInstances';
import MessageTrial from './MessageTrial';
import DeleteButton from './DeleteButton';

import { toast } from 'sonner';

const UserSubscription = () => {
  const { data: session, status } = useSession();
  const [jwt, setJwt] = useState(null);
  const [userId, setUserId] = useState(null);

  const [visibleKeys, setVisibleKeys] = useState({});

  const fetcher = async (url) => {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  };

  useEffect(() => {
    const getTokenAndUserId = async () => {
      const session = await getSession();
      if (session) {
        setJwt(session.jwt);
        try {
          const response = await fetch(`${strapiUrl}/api/users/me`, {
            headers: {
              Authorization: `Bearer ${session.jwt}`,
            },
          });
          if (response.ok) {
            const userData = await response.json();
            setUserId(userData.id);
          } else {
            console.error('Error fetching user data');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    getTokenAndUserId();
  }, []);

  const { data, error, isLoading } = useSWR(jwt ? `${strapiUrl}/api/users/me?populate=freetrials` : null, fetcher);

  // Log the data to the console to inspect the response structure
  //console.log("API Response Data:", data);

  if (status === 'loading' || isLoading || error || !data || !data.freetrials) return <OrderSkeleton />;
  if (data.freetrials.length === 0) return <NoInstances />;


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
        {data.freetrials.map((order) => (
          <li key={order.id} className="flex flex-col bg-white rounded-xl p-6 shadow-lg gap-4">


            {/* Titulo y fecha */}
            <div className="flex justify-between items-center mb-2">
              <p className="text-lg font-bold">Instancia gratuita - {order.instanceName}</p>
              <div className="bg-violet-200 px-2 py-1 rounded-sm inline-block">
                <p className="text-violet-700 text-xs">
                  Prueba gratis hasta el{' '}
                  {new Date(order.endDate).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>


            {/* API Key con íconos de ojo y copiar */}
            <div className="bg-gray-200 p-3 rounded-sm flex items-center justify-between">
              <p className="text-black text-sm font-mono">
                {visibleKeys[order.id]
                  ? order.apiKey
                  : '********-****-****-****-************'}
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => toggleKeyVisibility(order.id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {visibleKeys[order.id] ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={() => copyToClipboard(order.apiKey)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ClipboardIcon className="h-5 w-5" />
                </button>
              </div>
            </div>



            {/* Third Part: Button */}
            <div className="mt-4 flex flex-col md:flex-row md:justify-end space-y-4 md:space-y-0 md:space-x-4">
              {new Date(order.endDate) >= new Date() ? (
                <>
                  <Link href={`/instances/${order.instanceId}`} passHref>
                    <button
                      className="hover:shadow-lg transition-shadow duration-300 border border-gray-200 bg-white text-slate-900 px-6 py-2 rounded-lg text-base font-semibold shadow-md w-full md:w-auto flex items-center justify-center space-x-2"
                    >
                      <Cog6ToothIcon className="h-6 w-6" />
                      <span>Acceder</span>
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  {/* <span className="text-lg font-semibold text-red-500">
          Tu servicio fue cancelado
        </span> */}
                </>
              )}
              <div className="w-full md:w-auto">
                <DeleteButton documentId={order.documentId} instanceName={order.instanceName} />
              </div>
            </div>

          </li>
        ))}
      </ul>

      <div className='mt-8'>
        <MessageTrial />
      </div>
    </div>
  );
};

export default UserSubscription;
