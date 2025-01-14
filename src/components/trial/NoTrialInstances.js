import { PlusIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

import MessageTrial from '../trial/MessageTrial';

import { toast } from 'sonner';

export default function NoInstances() {
  const { data: session } = useSession(); // Accede a la sesión del usuario autenticado
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleButtonClick = async () => {
    setIsSubmitting(true);

    try {
      // Envía una solicitud POST al webhook de n8n, usando el correo del usuario autenticado
      const response = await fetch("https://n8n.rangel.pro/webhook/1fd23cdf-f701-48aa-973d-31022d9e3948", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session?.user?.email || "correo@predeterminado.com", // Usa el correo del usuario autenticado
          userId: session?.id || "ID no disponible",
        }),
      });

      if (response.ok) {
        const result = await response.json(); // Procesa el JSON de respuesta
        console.log("Resultado de la API:", result.message);
        toast.success('Instancia creada correctamente');
        window.location.reload();
      } else {
        console.error("Error al enviar la solicitud a n8n.");
        toast.error('Error al enviar la solicitud');
      }
    } catch (error) {
      console.error("Error de red:", error);
      toast.error('Error de conexión');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <MessageTrial />
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={isSubmitting}
          className={`inline-flex items-center rounded-md px-6 py-3 text-md font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
            isSubmitting
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 focus-visible:outline-blue-600"
          }`}
        >
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          {isSubmitting ? "Procesando..." : "Crear instancia de prueba"}
        </button>
      </div>
    </>
  );
}
