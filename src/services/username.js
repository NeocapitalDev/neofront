import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession, getSession } from 'next-auth/react'; // Importa useSession y getSession para manejar la sesión
import useSWR from 'swr';

const strapiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const UsernameDisplay = () => {
  const { data: session, status } = useSession(); // Obtén la sesión actual con NextAuth
  const [jwt, setJwt] = useState(null); // Estado para almacenar el token JWT

  const fetcher = async (url) => {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${jwt}` // Usa el JWT en las cabeceras
      }
    });

    if (!response.ok) {
      throw new Error('Error fetching data');
    }

    return response.json();
  };

  // Usamos useEffect para obtener el JWT desde la sesión cuando esté disponible
  useEffect(() => {
    const getToken = async () => {
      const session = await getSession(); // Obtiene la sesión actual
      if (session) {
        setJwt(session.jwt); // Guarda el token JWT en el estado
      }
    };

    getToken();
  }, []);

  // Usa useSWR para hacer la solicitud al backend de Strapi
  const { data, error, isLoading } = useSWR(jwt ? `${strapiUrl}/api/users/me` : null, fetcher);

  if (status === 'loading' || isLoading) return <div>Cargando..</div>;
  if (error) return <p>Ha ocurrido un error</p>;

  return <p>Tu nombre de usuario es: {data ? data.username : 'No disponible'}</p>;
};

export default UsernameDisplay;
