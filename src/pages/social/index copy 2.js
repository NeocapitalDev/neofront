// pages/socials.js
import { useStrapiData } from '../../lib/strapiService';

const SocialsPage = () => {
  // Usamos el hook que creamos para obtener los datos de 'socials'
  const { data: socials, error, isLoading } = useStrapiData('socials');

  // Si está cargando, mostramos un mensaje de carga
  if (isLoading) {
    return <div>Cargando...</div>;
  }

  // Si hay un error, mostramos el mensaje de error
  if (error) {
    return <div>Error al cargar los datos: {error.message}</div>;
  }

  // Si los datos se cargaron correctamente, los mostramos
  return (
    <div>
      <h1>Lista de Socials</h1>
      {socials && socials.length > 0 ? (
        <ul>
          {socials.map((social) => (
            <li key={social.id}>
              <h2>{social.nombre}</h2>
              <p>{social.accion}</p>
              <a href={social.url} target="_blank" rel="noopener noreferrer">
                {social.url}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div>No hay datos para mostrar.</div>
      )}
    </div>
  );
};

export default SocialsPage;
