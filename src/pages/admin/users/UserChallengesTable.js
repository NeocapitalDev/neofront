"use client";

import React, { useMemo } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DashboardLayout from "..";

const fetcher = (url, token) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json());

export default function UserChallengesTable({ userId, documentId }) {
  const { data: session } = useSession();

  // Obtén todos los desafíos existentes
  const { data: challengesData, error, isLoading } = useSWR(
    session?.jwt
      ? [`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenges?populate=*`, session.jwt]
      : null,
    ([url, token]) => fetcher(url, token)
  );

  // Filtrar desafíos que pertenecen al usuario según el `id` y `documentId`
  const userChallenges = useMemo(() => {
    if (!challengesData?.data) return [];
    return challengesData.data.filter(
      (challenge) =>
        challenge.userId === userId && challenge.documentId === documentId
    );
  }, [challengesData, userId, documentId]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <p className="text-center text-zinc-500">Cargando desafíos...</p>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <p className="text-center text-red-500">Error al cargar los datos.</p>
      </DashboardLayout>
    );
  }

  if (!userChallenges.length) {
    return (
      <DashboardLayout>
        <p className="text-center text-zinc-500">
          No hay desafíos disponibles para este usuario.
        </p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-zinc-900 text-zinc-200 rounded-lg shadow-lg">
        <h2 className="text-lg font-bold mb-4">Desafíos del Usuario</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Login</TableHead>
              <TableHead>Resultado</TableHead>
              <TableHead>Plataforma</TableHead>
              <TableHead>Etapa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userChallenges.map((challenge) => (
              <TableRow key={challenge.id}>
                <TableCell>{challenge.id}</TableCell>
                <TableCell>{challenge.login || "N/A"}</TableCell>
                <TableCell>{challenge.result || "N/A"}</TableCell>
                <TableCell>{challenge.platform || "N/A"}</TableCell>
                <TableCell>{challenge.phase || "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}
