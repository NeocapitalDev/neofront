// src/pages/dashboard/promotion.js
import useSWR from 'swr';
import { useSession } from 'next-auth/react';

const fetcher = async (url, token) => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Error: ${res.statusText}`);
  }
  return res.json();
};

export default function PromotionBanner() {
  const { data: session } = useSession();

  // Se consulta la promoción solo si existe un token
  const { data, error, isLoading } = useSWR(
    session?.jwt ? [`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/promotions?populate=*`, session.jwt] : null,
    ([url, token]) => fetcher(url, token)
  );

  if (isLoading) return <p>Cargando promoción...</p>;
  if (error)
    return <p className="text-red-500">Error al cargar promoción: {error.message}</p>;

  // Se asume que la respuesta es { data: [{ id, attributes: { url: '...'} }] }  
  // Ajusta según la estructura de tu respuesta.
  const promotion = data?.data?.[0];
  const promotionUrl = promotion?.attributes?.url || promotion?.url;

  return (
    <div className="my-4">
      {promotionUrl ? (
        <img
          src={promotionUrl}
          alt="Promoción"
          className="w-full h-80 object-cover rounded-md"
        />
      ) : (
        <p>No hay promociones disponibles</p>
      )}
    </div>
  );
}
