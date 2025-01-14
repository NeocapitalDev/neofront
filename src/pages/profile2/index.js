import React from 'react';
import { useSession } from 'next-auth/react';
import { TrashIcon } from '@heroicons/react/24/solid';
import ProfileLayout from '../../components/layout/ProfileLayout';

import { useState, useEffect } from 'react';


export default function General() {
  const { data: session } = useSession();

  const [email, setEmail] = useState('');

    // Llenar el campo de email cuando session.user.email esté disponible
    useEffect(() => {
      if (session?.user?.email) {
        setEmail(session.user.email);
      }
    }, [session]);

  return (
    <>
      <ProfileLayout>

          {/* Formulario */}
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
            <div className="grid">
              <p className="block text-md font-semibold leading-6 text-gray-900 mb-2">Información del perfil</p>
              <p className="block text-sm font-base leading-6 text-gray-900 mb-6">
                Actualice la información del perfil de su cuenta y su dirección de correo electrónico.
              </p>

              {/* Nombre */}

              {/* Correo electrónico */}

              <div>
                <label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-900">
                  Correo electrónico
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Ingresa tu correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-1/2 rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 text-base"
                  />
                </div>
              </div>




            </div>
          </div>

          {/* Botón de eliminación */}
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6 mt-6">
            <p className="block text-md font-semibold leading-6 text-gray-900 mb-2">¿Estás seguro de esto?</p>
            <p className="block text-sm font-base leading-6 text-gray-900 mb-6">
              Wazend eliminará sus suscripciones actuales y todos sus proyectos, junto con todas sus implementaciones, configuraciones y todos los demás recursos pertenecientes a su cuenta personal. Esta acción no es reversible.
            </p>
            <button
              type="button"
              onClick={() => window.open('https://api.whatsapp.com/send?phone=51924079147&text=Hola%2C%20quiero%20eliminar%20mi%20cuenta%20de%20Wazend.', '_blank')}
              className="inline-flex items-center gap-x-2 rounded-md bg-red-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              <TrashIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
              Sí, borrar mi cuenta
            </button>
          </div>

      </ProfileLayout>
    </>
  );
};

