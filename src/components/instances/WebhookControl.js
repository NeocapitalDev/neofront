import Link from 'next/link';
import useSWR from 'swr';
import { useEffect, useState } from 'react';

import { toast } from 'sonner';

const fetcher = (url) =>
    fetch(url, {
        method: 'GET',
        headers: {
            apiKey: process.env.NEXT_PUBLIC_WAZEND_API_KEY,
        },
    }).then((res) => res.json());

const WebhookControl = ({ instanceName }) => {
    const { data: webhookData, error, mutate } = useSWR(`${process.env.NEXT_PUBLIC_WAZEND_API_URL}/webhook/find/${instanceName}`, fetcher);
    const [webhookUrl, setWebhookUrl] = useState('');
    const [selectedEvents, setSelectedEvents] = useState([]);

    useEffect(() => {
        if (webhookData) {
            setWebhookUrl(webhookData.url || '');
            setSelectedEvents(webhookData.events || []);
            console.log('Datos de la API:', webhookData);
        }
    }, [webhookData]);

    const events = [
        "APPLICATION_STARTUP", "CALL", "CHATS_DELETE", "CHATS_SET", "CHATS_UPDATE", "CHATS_UPSERT",
        "CONNECTION_UPDATE", "CONTACTS_SET", "CONTACTS_UPDATE", "CONTACTS_UPSERT",
        "GROUP_PARTICIPANTS_UPDATE", "GROUP_UPDATE", "GROUPS_UPSERT", "LABELS_ASSOCIATION",
        "LABELS_EDIT", "LOGOUT_INSTANCE", "MESSAGES_DELETE", "MESSAGES_SET", "MESSAGES_UPDATE",
        "MESSAGES_UPSERT", "PRESENCE_UPDATE", "QRCODE_UPDATED", "REMOVE_INSTANCE", "SEND_MESSAGE"
    ];

    const handleEventChange = (event) => {
        const updatedEvents = selectedEvents.includes(event)
            ? selectedEvents.filter(e => e !== event)
            : [...selectedEvents, event];
        setSelectedEvents(updatedEvents);
    };

    const handleSave = async () => {
        const url = `${process.env.NEXT_PUBLIC_WAZEND_API_URL}/webhook/set/${instanceName}`;
        const params = {
            webhook: {
                enabled: selectedEvents.length > 0, // Si no hay eventos, "enabled" será false
                url: webhookUrl,
                byEvents: false,
                base64: false,
                events: selectedEvents, // Envía los eventos seleccionados o un array vacío
            },
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    apiKey: process.env.NEXT_PUBLIC_WAZEND_API_KEY, // Incluye el apiKey en el header
                },
                body: JSON.stringify(params), // Envía los parámetros en el formato adecuado
            });
            if (response.ok) {
                toast.success('Configuración guardada con éxito');
                mutate(); // actualiza los datos locales
            } else {
                toast.error('Error al guardar la configuración');
            }
        } catch (err) {
            console.error('Error al hacer la solicitud:', err);
        }
    };

    if (error) return <div>Error al cargar los datos</div>;
    if (!webhookData) return <div>Cargando...</div>;

    return (
        <section className='rounded-lg bg-white shadow-[0_0_5px_rgba(0,0,0,0.1)]'>
            <div className='flex justify-start p-4 mb-4 border-b-2'>
                <h2 className='text-xl font-semibold'>Ajustes de webhook</h2>
            </div>
            <div className='mt-2 mb-2 p-4'>
                <h3 className='text-sm font-semibold text-gray-800 mb-2'>Webhook URL</h3>
                <input
                    type='text'
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className='w-full rounded-md border border-gray-300 p-2 focus:border-emerald-600 focus:ring-emerald-600 focus:outline-none focus:ring-1'
                />
            </div>

            <div className='p-4'>
                <h3 className='text-sm font-semibold text-gray-800 mb-4'>Webhook Events</h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                    {events.map((event) => (
                        <div key={event} className='flex items-center'>
                            <input
                                type='checkbox'
                                id={event}
                                className='mr-2 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600'
                                checked={selectedEvents.includes(event)}
                                onChange={() => handleEventChange(event)}
                            />
                            <label htmlFor={event} className='text-sm font-semibold text-gray-600'>
                                {event}
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
                <button
                    onClick={handleSave}
                    className={`rounded-md px-4 py-2 font-medium text-white ${webhookUrl ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    disabled={!webhookUrl} // Deshabilita el botón si Webhook URL está vacío
                >
                    Guardar
                </button>
            </div>
            {/* <div className='p-4'>
                <h3 className='text-sm font-semibold text-gray-800 mb-2'>Datos del webhook</h3>
                <pre className='text-xs text-gray-600 bg-gray-100 p-2 rounded-md'>{JSON.stringify(webhookData, null, 2)}</pre>
            </div> */}
        </section>
    );
};

export default WebhookControl;
