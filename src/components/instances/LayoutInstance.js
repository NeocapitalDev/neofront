import { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { EyeIcon, EyeSlashIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import { UserIcon, ChatBubbleLeftEllipsisIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import ImagenQr from './ImagenQr';
import ButtonControl from './ButtonControl';

import WebhookControl from './WebhookControl';


// Función fetcher que usa axios y pasa instanceId como parámetro
const fetcher = (url, instanceId) =>
  axios.get(url, {
    //headers: { apiKey: 'UkVKATZZMZqZgtxMscKhfhbxORHDH41K' },
    headers: {
      apiKey: process.env.NEXT_PUBLIC_WAZEND_API_KEY,
    },
    params: { instanceId },
  }).then((res) => res.data);

const LayoutInstance = ({ instanceId }) => {
  const [isTokenVisible, setIsTokenVisible] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const { data: instanceData, error } = useSWR(
    instanceId ? [`${process.env.NEXT_PUBLIC_WAZEND_API_URL}/instance/fetchInstances`, instanceId] : null,
    ([url, id]) => fetcher(url, id)
  );

  if (error) return <p>Error: {error.message}</p>;
  if (!instanceData) return <p>Cargando...</p>;
  if (instanceData.length === 0) return <p>No instance data available</p>;

  const instance = instanceData[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(instance.token);
    toast.success('Copiado exitosamente.');
  };

  const handleShowQr = () => {
    setShowQr(true);
  };

  return (
    <>
      <div className='space-y-8'>

        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Instancia #{instance.name}</h1>

        <div>
          <a
            href="https://docs.wazend.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Documentación
          </a>
        </div>


        <section className='rounded-lg bg-white shadow-[0_0_5px_rgba(0,0,0,0.1)]'>
          <div className='flex flex-col md:flex-row'>

            {/* Primera columna */}
            <div className='flex-1 border-b border-gray-200 p-4 md:border-b-0 md:border-r'>
              <div className='flex-1 flex-col p-4'>

                <div className='flex align-center justify-between'>
                  <div className='mb-8 md:mb-11'>
                    <h3 className='text-sm font-base'>Nombre de instancia</h3>
                    <p className='text-lg font-medium text-green-600'>{instance.name}</p>
                  </div>

                  <div className='text-sm font-medium pt-5'>
                    <p
                      className={`rounded-full px-2.5 py-0.5 ${instance.connectionStatus === 'close'
                        ? 'bg-red-500 text-white'
                        : instance.connectionStatus === 'connecting'
                          ? 'bg-amber-500 text-white'
                          : instance.connectionStatus === 'open'
                            ? 'bg-green-500 text-white'
                            : 'bg-cyan-100'
                        }`}
                    >
                      {instance.connectionStatus === 'close'
                        ? 'Desconectado'
                        : instance.connectionStatus === 'connecting'
                          ? 'Conectando'
                          : instance.connectionStatus === 'open'
                            ? 'Conectado'
                            : instance.connectionStatus}
                    </p>
                  </div>

                </div>

                <div>
                  <h3 className='text-sm font-base'>Última conexión</h3>
                  <p className='text-lg font-semibold text-blue-500'>
                    {new Date(instance.updatedAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })} ({new Date(instance.updatedAt).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false
                    })})
                  </p>
                </div>

              </div>
            </div>

            {/* Segunda columna */}
            <div className='flex-1 border-b border-gray-200 p-4 md:border-b-0 md:border-r'>
              <div className='flex-1 flex-col p-4'>

                <div className='mb-8 md:mb-11'>
                  <h3 className='text-sm font-base'>Token</h3>
                  <div className="flex items-center space-x-2">
                    <p className='text-lg font-medium text-green-600'>
                      {isTokenVisible ? instance.token : '••••••••••'}
                    </p>
                    <button
                      onClick={() => setIsTokenVisible(!isTokenVisible)}
                      className="focus:outline-none"
                    >
                      {isTokenVisible ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-900" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-800" />
                      )}
                    </button>
                    <button
                      onClick={handleCopy}
                      className="focus:outline-none"
                    >
                      <ClipboardIcon className="h-5 w-5 text-gray-800" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className='text-sm font-base'>Creado el</h3>
                  <p className='text-lg font-semibold text-blue-500'>
                    {new Date(instance.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })} ({new Date(instance.createdAt).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false
                    })})
                  </p>
                </div>


              </div>
            </div>

            {/* Final columna */}

          </div>
        </section>

        <section className='rounded-lg bg-white shadow-[0_0_5px_rgba(0,0,0,0.1)]'>
          <div className='flex flex-col md:flex-row'>

            {/* Contactos */}
            <div className='flex-1 border-b border-gray-200 p-4 md:border-b-0 md:border-r'>
              <div className='flex-1 flex-col p-4'>
                <div className="flex items-center space-x-1">
                  <UserIcon className="h-5 w-5 text-blue-500" />
                  <h3 className='text-sm font-base'>Contactos</h3>
                </div>
                <p className='mt-2 text-lg font-semibold text-blue-500'>{instance._count.Contact}</p>
              </div>
            </div>

            {/* Chats */}
            <div className='flex-1 border-b border-gray-200 p-4 md:border-b-0 md:border-r'>
              <div className='flex-1 flex-col p-4'>
                <div className="flex items-center space-x-2">
                  <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-blue-500" />
                  <h3 className='text-sm font-base'>Chats</h3>
                </div>
                <p className='mt-2 text-lg font-semibold text-blue-500'>{instance._count.Chat}</p>
              </div>
            </div>

            {/* Mensajes */}
            <div className='flex-1 border-b border-gray-200 p-4 md:border-b-0'>
              <div className='flex-1 flex-col p-4'>
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className="h-5 w-5 text-blue-500" />
                  <h3 className='text-sm font-base'>Mensajes</h3>
                </div>
                <p className='mt-2 text-lg font-semibold text-blue-500'>{instance._count.Message}</p>
              </div>
            </div>

          </div>
        </section>


        {/* Seccion de conexion*/}

        {instance.connectionStatus === 'open' && (
          <section className='rounded-lg bg-white p-6 shadow-[0_0_5px_rgba(0,0,0,0.1)]'>
            <h2 className='mb-4 text-xl font-semibold'>Tu número de WhatsApp conectado</h2>
            <div className="group block flex-shrink-0">
              <div className="flex items-center">
                <div>
                  <img
                    className="inline-block h-12 w-12 rounded-full"
                    src={instance.profilePicUrl}
                    alt={instance.profileName}
                  />
                </div>
                <div className="ml-3">
                  <p className="text-md font-semibold text-black">{instance.profileName}</p>
                  <p className="text-sm font-base text-gray-500">{instance.ownerJid}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <ButtonControl instanceName={instance.name} />
            </div>

          </section>
        )}

        {instance.connectionStatus !== 'open' && (
          <section className='rounded-lg bg-white p-6 shadow-[0_0_5px_rgba(0,0,0,0.1)]'>
            <h2 className='mb-4 text-xl font-semibold'>Conecta tu WhatsApp</h2>
            <p className='mb-1'>Escanee el código QR para conectar su número de teléfono de WhatsApp con esta instancia.</p>
            <p className='mb-8'>Después de eso, podrá enviar y recibir mensajes de WhatsApp.</p>
            <div className='flex flex-col md:flex-row md:space-x-4'>

              <div className='w-full md:w-[500px] h-[280px] border-2 border-gray-200 p-2 rounded-lg overflow-hidden'>
                <Image
                  src='/images/scan-wa.gif'
                  alt='Hand holding a phone with WhatsApp'
                  width={200}
                  height={50}
                  className='w-full h-full object-cover rounded-md'
                />
              </div>


            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:justify-end sm:space-x-2 space-y-2 sm:space-y-0">
              <button
                onClick={handleShowQr}
                className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
              >
                Mostrar QR
              </button>

              {showQr && (
                <div className="mt-4">
                  <ImagenQr instanceName={instance.name} />
                </div>
              )}

              <ButtonControl instanceName={instance.name} />
            </div>

          </section>
        )}

        {/* Seccion de ajustes*/}
        <WebhookControl instanceName={instance.name} />

        {/* <section className='rounded-lg bg-white shadow-[0_0_5px_rgba(0,0,0,0.1)]'>
          <div className='flex justify-start p-4 mb-4 border-b-2'>
            <h2 className='text-xl font-semibold'>Ajustes de instancia (Proximamente)</h2>
          </div>
          <div className='mt-2 mb-2 p-4'>
            <h3 className='text-sm font-semibold text-gray-800 mb-2'>Webhook URL</h3>
            <input
              type='text'
              placeholder='https://your-domain.com/instance/22735/webhook'
              className='w-full rounded-md border border-gray-300 p-2'
            />
          </div>
          
          <div className='p-4'>
            <h3 className='text-sm font-semibold text-gray-800 mb-4'>Webhook Events</h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
              {[
                "APPLICATION_STARTUP",
                "CALL",
                "CHATS_DELETE",
                "CHATS_SET",
                "CHATS_UPDATE",
                "CHATS_UPSERT",
                "CONNECTION_UPDATE",
                "CONTACTS_SET",
                "CONTACTS_UPDATE",
                "CONTACTS_UPSERT",
                "GROUP_PARTICIPANTS_UPDATE",
                "GROUP_UPDATE",
                "GROUPS_UPSERT",
                "LABELS_ASSOCIATION",
                "LABELS_EDIT",
                "LOGOUT_INSTANCE",
                "MESSAGES_DELETE",
                "MESSAGES_SET",
                "MESSAGES_UPDATE",
                "MESSAGES_UPSERT",
                "PRESENCE_UPDATE",
                "QRCODE_UPDATED",
                "REMOVE_INSTANCE",
                "SEND_MESSAGE",
              ].map((event) => (
                <div key={event} className='flex items-center'>
                  <input
                    type='checkbox'
                    id={event}
                    className='mr-2 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600'
                  />
                  <label htmlFor={event} className='text-sm font-semibold text-gray-600 flex items-center'>
                    {event}{' '}
                    <span className='ml-2 h-3 w-3 border border-gray-600 rounded-full text-gray-600 text-[0.5rem] font-semibold flex items-center justify-center'>
                      &#105;
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className='py-2 px-4'>
            <p className='text-sm text-gray-500 mb-1'>
              Tan pronto como ocurra uno de estos eventos, se llamará la URL del webhook anterior con los datos del evento.
            </p>
            <p className='text-sm text-blue-500 mb-6'>
              <Link href='https://docs.wazend.net/'>Consulte la documentación para obtener más información sobre los webhooks.</Link>

            </p>
          </div>
          <div className='px-4 pb-4'>
            <button className='rounded-md bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700 font-medium'>Guardar</button>
          </div>
        </section> */}


      </div>
    </>
  );
};

export default LayoutInstance;
