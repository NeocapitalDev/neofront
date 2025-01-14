import { useEffect, useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import useSWR, { mutate } from 'swr';
import NoOrders from './NoOrders';
import OrderSkeleton from './OrderSkeleton';
import Image from 'next/image';

import Link from 'next/link';

import { ArrowTopRightOnSquareIcon, ArrowRightCircleIcon } from '@heroicons/react/24/outline'

const strapiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const UserSubscription = () => {
  const { data: session, status } = useSession();
  const [jwt, setJwt] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

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

  const { data, error, isLoading } = useSWR(jwt ? `${strapiUrl}/api/users/me?populate=subscriptions` : null, fetcher);

  const createOrder = async () => {
    setIsCreating(true);
    try {
      const response = await fetch(`${strapiUrl}/api/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          data: {
            selectedPlan: 'basic',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            user: { connect: userId },
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear la orden');
      }

      console.log('Orden creada con éxito');
      mutate(`${strapiUrl}/api/users/me?populate=subscriptions`);
    } catch (error) {
      console.error('Error al crear la orden:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (status === 'loading' || isLoading || error || !data || !data.subscriptions) return <OrderSkeleton />;
  if (data.subscriptions.length === 0) return <NoOrders />;

  return (
    <div>
      <ul className="space-y-4">
        {data.subscriptions.map((order) => (
          <li key={order.id} className="flex flex-col md:flex-row bg-white rounded-xl p-8 shadow-lg gap-4 md:items-center ">
            {/* Primera Parte: Imagen */}
            {/* <div className="hidden md:block"> */}
            <div className="hidden">
              <Image
                src='/images/pattern-1.jpg'
                alt="Plan image"
                className="w-32 h-30 object-cover rounded-lg"
                width={118}
                height={89}
              />
            </div>

            {/* Segunda Parte: Contenido del plan y fecha */}
            <div className="md:w-1/3 flex-grow">
              {/* <div className="flex flex-row items-center space-x-2 text-emerald-600">
                <a href={`https://${order.url}`} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold hover:underline">Wazend {order.plan}</a>
                <ArrowTopRightOnSquareIcon className='h-4 w-4 text-emerald-700' />
              </div> */}

              {/* <div className="flex flex-row items-center space-x-2 text-emerald-600">
                <p className="text-lg font-semibold hover:underline">Wazend {order.plan}</p>
              </div> */}

              <p className="text-2xl font-bold">Wazend {order.type} (#{order.id})</p>
              <div className="flex flex-row items-center space-x-2 mt-1 text-gray-500">
                <div className={`w-3 h-3 rounded-full ${order.statusPlan === 'pending' ? 'bg-yellow-500' : order.statusPlan === 'active' ? 'bg-green-500' : order.statusPlan === 'expired' ? 'bg-red-500' : 'bg-gray-500'}`} />
                <p className="text-sm font-bold uppercase">PLAN {order.plan}</p>
                <p className="text-sm">Expira el {new Date(order.endDate).toLocaleDateString('es-ES')}</p>
              </div>
            </div>


            {order.type === 'API' ? (
              <div className="flex justify-end space-x-4">
                {new Date(order.endDate) >= new Date() ? (
                  <>
                    <Link href={`/instances/${order.instanceId}`} passHref>
                      <button
                        className="hover:shadow-lg transition-shadow duration-300 border border-gray-200 bg-white text-slate-900 px-6 py-2 rounded-lg text-lg font-semibold shadow-md w-full md:w-auto flex items-center justify-center space-x-2"
                      >
                        <ArrowRightCircleIcon className="h-6 w-6" />
                        <span>Acceder</span>
                      </button>
                    </Link>
                  </>
                ) : (
                  <span className="text-lg font-semibold text-red-500">
                    Tu servicio fue cancelado
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col md:flex-row md:justify-end space-y-4 md:space-y-0 md:space-x-4">
                {new Date(order.endDate) >= new Date() ? (
                  <>
                    <Link href={`/services/${order.documentId}`} passHref>
                      <button
                        className="hover:shadow-lg transition-shadow duration-300 border border-gray-200 bg-white text-slate-900 px-6 py-2 rounded-lg text-lg font-semibold shadow-md w-full md:w-auto flex items-center justify-center space-x-2"
                      >
                        <ArrowRightCircleIcon className="h-6 w-6" />
                        <span>Acceder</span>
                      </button>
                    </Link>
                  </>
                ) : (
                  <span className="text-lg font-semibold text-red-500">
                    Tu servicio fue cancelado
                  </span>
                )}
              </div>
            )}



          </li>
        ))}
      </ul>

      {/* <button
        onClick={createOrder}
        disabled={isCreating}
        className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
      >
        {isCreating ? 'Creando Orden...' : 'Crear Nueva Orden'}
      </button> */}
    </div>
  );
};

export default UserSubscription;