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
import RuletaSorteo from "@/components/roullete/roullete";

export default function ModalRoullete() {
  return (
    <Dialog>
      <DialogTrigger className="p-3 bg-black text-yellow-500 rounded-full hover:bg-yellow-500 hover:text-black transition-colors">
        <Gift size={64} />
      </DialogTrigger>
      <DialogContent className="bg-black text-yellow-500 p-6 rounded-lg border-2 border-yellow-500 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Ruleton
          </DialogTitle>
          <DialogDescription className="mt-2">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. At aliquid illo, tempora dignissimos temporibus natus dolor libero non similique odit amet accusamus, laborum, tempore provident harum mollitia tenetur! Modi, rerum!
          </DialogDescription>
        </DialogHeader>
        <RuletaSorteo />
      </DialogContent>
    </Dialog>
  )
}
