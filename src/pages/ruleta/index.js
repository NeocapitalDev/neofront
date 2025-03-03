import React, { useEffect, useState } from "react";
import RuletaSorteo from "./Ruleta";
import DashboardLayout from "../admin";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { useStrapiData } from "src/services/strapiServiceId";

export default function Index() {
    const [open, setOpen] = useState(false);
    // Estado para los tickets
    const [tickets, setTickets] = useState([]);

    // Obtiene la sesión del usuario
    const { data: session } = useSession();

    // Llama a Strapi para obtener los usuarios que coincidan con el email
    const {
        data: users,
        isLoading,
        error,
    } = useStrapiData(
        `users?populate=*&filters[email][$eq]=${session?.user?.email}`
    );

    // Al cargar los datos, si hay un usuario, guarda sus tickets en el estado
    useEffect(() => {
        if (users && Array.isArray(users) && users.length > 0) {
            // Ajusta según la estructura real de tu usuario en Strapi
            setTickets(users[0].tickets || []);
        }
    }, [users]);
    console.log(tickets);
    return (
        <DashboardLayout>
            <RuletaSorteo />

            <Button onClick={() => setOpen(true)}>Ver Tickets</Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogTitle>Tickets Relacionados</DialogTitle>

                    {isLoading && <p>Cargando tickets...</p>}
                    {error && <p>Error al cargar tickets</p>}

                    {/* Muestra los tickets si existen, sino un mensaje */}
                    {tickets && tickets.length > 0 ? (
                        <ul>
                            {tickets.map((ticket) => (
                                <li key={ticket.id}>
                                    {ticket.name} - {ticket.id} - {ticket.porcentaje}%
                                </li>
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
