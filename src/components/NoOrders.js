// NoOrders.js
import { DocumentTextIcon, GiftIcon, PlusIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';

const NoOrders = () => {

  return (
    <>
      <div className="bg-white rounded-xl px-6 py-20 text-center shadow-lg w-full mx-auto">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
        <h3 className="mt-2 text-xl font-semibold text-gray-900">¡No tienes ningún servicio contratado! 🥲</h3>

        <div className="mt-8 flex flex-col md:flex-row md:justify-center md:space-x-4 space-y-4 md:space-y-0">

          {/* Botón para abrir el modal */}
          <Link
            href="https://docs.wazend.net/"
            target='_blank'
            className="px-6 py-3 rounded-lg text-base font-medium inline-flex items-center justify-center w-full md:w-auto bg-gray-600  text-md text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
          >
            <DocumentTextIcon
              className="-ml-0.5 mr-1.5 h-5 w-5"
              aria-hidden="true"
            />
            Documentación
          </Link>

          {/* Enlace a prueba gratis */}
          <Link
            href="/trial"
            className="px-6 py-3 rounded-lg text-base font-medium inline-flex items-center justify-center w-full md:w-auto bg-blue-600 text-md text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <GiftIcon
              className="-ml-0.5 mr-1.5 h-5 w-5"
              aria-hidden="true"
            />
            Prueba gratis
          </Link>
      
        </div>
      </div>
    </>
  );
};

export default NoOrders;