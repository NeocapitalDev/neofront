import React, { useState } from 'react';
import useSWR from 'swr';
import RuletaSorteo from './Ruleta';
import DashboardLayout from '../admin';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Index() {
    const [open, setOpen] = useState(false);
    
    const { data, isLoading, error } = useSWR(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tickets?populate=*`,
        fetcher
    );

    return (
        <DashboardLayout>
            <RuletaSorteo />
            <Button onClick={() => setOpen(true)}>Ver Tickets</Button>
            
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogTitle>Tickets Relacionados</DialogTitle>
                    {isLoading && <p>Cargando tickets...</p>}
                    {error && <p>Error al cargar tickets</p>}
                    {data && data.data?.length > 0 ? (
                        <ul>
                            {data.data.map((ticket) => (
                                <li key={ticket.id}>{ticket.name} - {ticket.porcentaje}%</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No hay tickets disponibles.</p>
                    )}
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
