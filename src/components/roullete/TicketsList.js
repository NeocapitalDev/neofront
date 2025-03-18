import React, { useState } from 'react';
import Link from 'next/link';
import {
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import RuletaSorteo from './RoulleteWo';
import { useStrapiData } from '@/services/strapiService';
import { useSession } from "next-auth/react";

// Definir la variable CSS --app-primary como amarillo
const styleVars = {
  "--app-primary": "#FFD700" // Color amarillo dorado
};

// Individual TicketCard component
const TicketCard = ({ ticket, onOpenRoulette }) => {
  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center card bg-black/95 py-2 px-3 gap-4 w-full mx-auto border border-yellow-600 rounded-lg">
      {/* Left side icon */}
      <div className="w-full md:w-auto justify-center md:justify-start md:flex hidden">
        <div className="p-3 rounded-full bg-gray-800">
          <TicketIcon className="h-10 w-10 text-yellow-400" />
        </div>
      </div>

      {/* Center: Ticket info */}
      <div className="flex flex-col md:items-start md:justify-center">
        {/* Ticket ID and type */}
        <div className="flex items-center font-semibold space-x-2 text-md text-yellow-400">
          <span>Ticket #{ticket.id}</span>
        </div>

        {/* Ticket code */}
        <span className="text-lg font-semibold text-yellow-300">
          {ticket.codigo || 'No definido'}
        </span>

        {/* Status and expiration */}
        <div className="flex items-center space-x-2 text-sm mt-1">
          <div className="inline-flex items-center gap-1">
            <span className={`inline-block w-2 h-2 rounded-full ${ticket.habilitado ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`font-semibold ${ticket.habilitado ? 'text-green-500' : 'text-red-500'}`}>
              {ticket.habilitado ? 'Sin usar' : 'Usado'}
            </span>
          </div>
          <span className="text-gray-400">Expira {formatDate(ticket.fechaExpiracionTicket)}</span>
        </div>

        {/* Show percentage if available */}
        {ticket.porcentaje !== null && (
          <div className="flex items-center gap-2 mt-1 text-sm">
            <span className="font-medium text-green-500">Descuento: {ticket.porcentaje}%</span>
            {/* <div className="w-24 bg-gray-700 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full"
                style={{ width: `${ticket.porcentaje}%` }}
              ></div>
            </div> */}
          </div>
        )}
      </div>

      {/* Right: Buttons and prize info */}
      <div className="flex md:ml-auto mt-2 md:mt-0 gap-4">
        {/* If ticket is enabled and no prize, show "Obtener Premio" button */}
        {ticket.habilitado && !ticket.premio ? (
          <button
            onClick={() => onOpenRoulette(ticket)}
            className="w-full sm:w-auto hover:shadow-lg transition-shadow duration-300 border border-yellow-600 bg-yellow-500 text-black px-6 py-2 rounded-lg text-base font-semibold shadow-md flex items-center justify-center space-x-2"
          >
            <span>Girar</span>
          </button>
        ) : (
          // If ticket has prize, show prize info
          ticket.premio ? (
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-400">Premio</span>
              <span className="font-semibold text-yellow-400">{ticket.premio}</span>
            </div>
          ) : (
            // If ticket is used and has no prize
            <span className="w-full sm:w-auto text-center text-base font-semibold bg-red-600 text-white px-6 py-2 rounded-lg">
              Usado
            </span>
          )
        )}

        {/* View details button - Commented out in original code */}
        {/* <Link href={`/tickets/${ticket.id}`} passHref className="w-full sm:w-auto">
          <button className="w-full hover:shadow-lg transition-shadow duration-300 border border-yellow-600 bg-gray-800 text-yellow-400 px-6 py-2 rounded-lg text-base font-semibold shadow-md flex items-center justify-center space-x-2">
            <Cog6ToothIcon className="h-6 w-6" />
            <span>Detalles</span>
          </button>
        </Link> */}
      </div>
    </div>
  );
};

// Main TicketCards component
export default function TicketCards() {
  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const { data: session, status } = useSession();

  // Fetch tickets data
  const { data: tickets, error, isLoading } = useStrapiData(`tickets?populate=users_permissions_user&filters[users_permissions_user][email][$eq]=${session?.user?.email || ''}`);

  // Function to open roulette modal
  const handleOpenRoulette = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  // Modal component
  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 w-full">
        <div className="bg-black border border-[var(--app-primary)] rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-auto flex flex-col justify-center ">
          <div className='flex justify-end'>
            <button
              onClick={onClose}
              className="text-yellow-500 hover:text-yellow-300"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col justify-center items-center mb-4">
            <h3 className="text-2xl font-bold text-[--app-secondary] text-center">Ruleta Ganadora</h3>
            <div className='text-center mb-4 text-[var(--app-primary)]'>
              {/* <h1 className='text-xl font-bold text-center'>Ruleta Ganadora</h1> */}
              <p>¡Prueba tu suerte ahora!</p>
            </div>
          </div>
          {children}
        </div>
      </div>
    );
  };

  // Render loading state or error
  if (isLoading) return <div className="container mx-auto px-4 py-6 text-yellow-400 bg-black">Cargando tickets...</div>;
  if (error) return <div className="container mx-auto px-4 py-6 text-red-500 bg-black">Error al cargar los tickets</div>;

  return (
    <div className="container mx-auto px-4 py-6 bg-black text-yellow-50" style={styleVars}>
      <h1 className="text-2xl font-bold mb-6 text-yellow-400">Mis Tickets</h1>

      {/* Show message if no tickets */}
      {(!tickets || tickets.length === 0) && (
        <div className="text-center py-8 bg-zinc-900 rounded-lg border border-yellow-800">
          <TicketIcon className="h-12 w-12 mx-auto text-yellow-500 mb-3" />
          <p className="text-yellow-200">No tienes tickets disponibles</p>
        </div>
      )}

      {/* Tickets list */}
      <div className="space-y-4">
        {tickets && tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onOpenRoulette={handleOpenRoulette}
          />
        ))}
      </div>

      {/* Modal with Roulette */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedTicket && (
          <div className=''>
            <RuletaSorteo documentId={selectedTicket.documentId} />
          </div>
        )}
      </Modal>
    </div>
  );
}