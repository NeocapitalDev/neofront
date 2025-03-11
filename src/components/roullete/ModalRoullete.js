import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Gift } from 'lucide-react'
import RuletaSorteo from "@/components/roullete/RoulleteWo";
import TicketsList from './TicketsList';

export default function ModalRoullete() {

  return (
    <Dialog className="">
      <DialogTrigger className="p-3 bg-black text-[var(--app-primary)] rounded-full hover:bg-[var(--app-primary)] hover:text-black transition-colors">
        <Gift size={64} />
      </DialogTrigger>
      <DialogContent className="bg-black text-[var(--app-secondary)] p-3 rounded-lg border-2 border-[var(--app-secondary)] shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
          </DialogTitle>
          <DialogDescription className="mt-2">
          </DialogDescription>
        </DialogHeader>

        <TicketsList> </TicketsList>
        {/* <RuletaSorteo /> */}
      </DialogContent>
    </Dialog>
  )
}
