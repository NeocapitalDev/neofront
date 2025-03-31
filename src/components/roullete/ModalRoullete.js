import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Gift } from 'lucide-react';
import TicketsList from './TicketsList';
import { useSession } from "next-auth/react";
import { useStrapiData as strapiJWT } from 'src/services/strapiServiceJWT';



export default function ModalRoulette() {
  const TICKET_ID = process.env.NEXT_PUBLIC_TICKET_ID || 0;
  const { data: session, status } = useSession();
  // console.log('session', session);
  const { data: user, status: statusUser } = strapiJWT('users/me', session?.jwt || '');
  const handleBuyTicket = () => {
    // Aquí puedes agregar la lógica para comprar un ticket
    console.log("Comprar ticket");
    // const woocommerceId = matchingVariation?.id || selectedProduct.woocommerceId;
    window.location.href = `https://neocapitalfunding.com/checkout/?add-to-cart=${TICKET_ID}&quantity=1&user_id=${user.documentId}`;
  };

  return (
    <Dialog>
      <DialogTrigger className="z-10 p-1 bg-zinc-900 text-amber-400 rounded-full hover:bg-amber-500 hover:text-black transition-colors duration-300">
        <img
          src="/images/sorteo.svg"
          alt="Sorteo"
          width={30}
          height={30}
          className="w-24 h-24"
        />
      </DialogTrigger>

      {/* Forzamos que el contenido esté por encima con z-[9999] */}
      <DialogContent
        className="
      z-[9999] 
      bg-zinc-900 
      text-white 
      p-0 
      rounded-lg 
      border-2 
      border-amber-400 
      shadow-[0_0_20px_rgba(245,158,11,0.25)] 
      max-w-sm 
      w 
      max-h-[90vh] 
      overflow-hidden
    "
      >
        <DialogHeader className="p-6 border-b border-amber-700 bg-gradient-to-b from-zinc-900 to-zinc-800">
          <DialogTitle className="text-2xl font-bold text-center flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-amber-500 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              <Gift className="h-8 w-8 text-amber-400" />
            </div>
            <span className="text-amber-300">Mis Tickets</span>
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable content area */}

        <div className=" flex justify-center p-4">
          <button
            onClick={handleBuyTicket}
            className="px-6 py-3 bg-[var(--app-primary)] text-white font-bold rounded-lg hover:brightness-110 transition-all duration-300 shadow-md w-full"
          >
            Comprar Ticket
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(80vh-140px)] py-4 px-4 bg-zinc-900">

          <TicketsList />
          <div className="sticky bottom-0 left-0 right-0 h-4 pointer-events-none -mt-4"></div>
        </div>
      </DialogContent>
    </Dialog>

  );
}