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
            Ruleton
          </DialogTitle>
          <DialogDescription className="mt-2">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. At aliquid illo, tempora dignissimos temporibus natus dolor libero non similique odit amet accusamus, laborum, tempore provident harum mollitia tenetur! Modi, rerum!
          </DialogDescription>
        </DialogHeader>

        <TicketsList> </TicketsList>
        {/* <RuletaSorteo /> */}
      </DialogContent>
    </Dialog>
  )
}
