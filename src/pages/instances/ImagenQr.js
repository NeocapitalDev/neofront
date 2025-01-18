import { useState, useEffect, Fragment } from 'react';
import Image from 'next/image';
import { Dialog, Transition } from '@headlessui/react';

const QRCodeComponent = ({ instanceName }) => {
  const [qrBase64, setQrBase64] = useState('');
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_WAZEND_API_URL}/instance/connect/${instanceName}`, {
          method: 'GET',
          headers: {
            apiKey: process.env.NEXT_PUBLIC_WAZEND_API_KEY,
          },
        });
        const data = await response.json();
        console.log('API Response:', data);
        setQrBase64(data.base64);
      } catch (error) {
        console.error('Error fetching QR code:', error);
      }
    };

    fetchQRCode();
  }, []);

  const handleClose = () => {
    setOpen(false);
    window.location.reload(); // Recarga la página cuando se cierra el modal
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                <div>
                  <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                    Escanea el código QR con tu WhatsApp
                  </Dialog.Title>
                  {qrBase64 ? (
                    <Image
                      src={qrBase64}
                      alt='QR Code'
                      width={200}
                      height={200}
                      className='rounded-md w-full h-full object-cover'
                    />
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
                <div className="mt-5 sm:mt-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    onClick={handleClose}
                  >
                    Listo
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default QRCodeComponent;
