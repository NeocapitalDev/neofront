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
    <div className="flex flex-col md:flex-row md:items-center card-border bg-white p-6 gap-4 w-full mx-auto">
      {/* Left side icon */}
      <div className="w-full md:w-auto justify-center md:justify-start md:flex hidden">
        <div className="p-3 rounded-full bg-gray-100">
          <TicketIcon className="h-10 w-10 text-gray-600" />
        </div>
      </div>

      {/* Center: Ticket info */}
      <div className="flex flex-col md:items-start md:justify-center">
        {/* Ticket ID and type */}
        <div className="flex items-center font-semibold space-x-2 text-md text-[color:var(--app-primary)]">
          <span>Ticket #{ticket.id}</span>
        </div>

        {/* Ticket code */}
        <span className="text-lg font-semibold text-gray-800">
          {ticket.codigo || 'No definido'}
        </span>

        {/* Status and expiration */}
        <div className="flex items-center space-x-2 text-sm mt-1">
          <div className="inline-flex items-center gap-1">
            <span className={`inline-block w-2 h-2 rounded-full ${ticket.habilitado ? 'bg-green-600' : 'bg-red-600'}`} />
            <span className={`font-semibold ${ticket.habilitado ? 'text-green-600' : 'text-red-600'}`}>
              {ticket.habilitado ? 'Sin usar' : 'Usado'}
            </span>
          </div>
          <span className="text-gray-500">Expira {formatDate(ticket.fechaExpiracionTicket)}</span>
        </div>

        {/* Show percentage if available */}
        {ticket.porcentaje !== null && (
          <div className="flex items-center gap-2 mt-1 text-sm">
            <span className="font-medium text-green-600">Descuento: {ticket.porcentaje}%</span>
            {/* <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
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
            className="w-full sm:w-auto hover:shadow-lg transition-shadow duration-300 border border-gray-200 bg-blue-600 text-white px-6 py-2 rounded-lg text-base font-semibold shadow-md flex items-center justify-center space-x-2"
          >
            <span>Obtener Premio</span>
          </button>
        ) : (
          // If ticket has prize, show prize info
          ticket.premio ? (
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-500">Premio</span>
              <span className="font-semibold text-green-600">{ticket.premio}</span>
            </div>
          ) : (
            // If ticket is used and has no prize
            <span className="w-full sm:w-auto text-center text-base font-semibold bg-red-500 text-white px-6 py-2 rounded-lg">
              Ticket usado
            </span>
          )
        )}

        {/* View details button */}
        {/* <Link href={`/tickets/${ticket.id}`} passHref className="w-full sm:w-auto">
          <button className="w-full hover:shadow-lg transition-shadow duration-300 border border-gray-200 bg-white text-slate-900 px-6 py-2 rounded-lg text-base font-semibold shadow-md flex items-center justify-center space-x-2">
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
  // Fetch tickets data using the same hook pattern from the original component
  const { data: tickets, error, isLoading } = useStrapiData(`tickets?populate=users_permissions_user&filters[users_permissions_user][email][$eq]=${session?.user?.email || ''}`);
  console.log(session)
  console.log(tickets)
  // Function to open roulette modal
  const handleOpenRoulette = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  // Modal component
  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-auto">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold">Ruleta de Premios</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  // Render loading state or error
  if (isLoading) return <div className="container mx-auto px-4 py-6">Cargando tickets...</div>;
  if (error) return <div className="container mx-auto px-4 py-6 text-red-500">Error al cargar los tickets</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Mis Tickets</h1>

      {/* Show message if no tickets */}
      {(!tickets || tickets.length === 0) && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <TicketIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">No tienes tickets disponibles</p>
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
          <RuletaSorteo documentId={selectedTicket.documentId} />
        )}
      </Modal>
    </div>
  );
}