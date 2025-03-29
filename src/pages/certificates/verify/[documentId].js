// /src/pages/certificates/verify/[documentId].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Loader from '../../../components/loaders/loader';
// Importamos el componente Certificates existente - ajusta la ruta según tu estructura de archivos
import Certificates from "../../metrix2/certificates";
// Importamos el componente Toaster y la función toast de sonner
import { Toaster, toast } from 'sonner';

export default function CertificateVerify() {
  const router = useRouter();
  const { documentId } = router.query;
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener los datos del certificado desde la API
  useEffect(() => {
    if (!documentId) return;
  
    const fetchCertificate = async () => {
      try {
        const response = await fetch(`/api/certificates/${documentId}`);
        if (!response.ok) {
          throw new Error('Certificado no encontrado');
        }
        const data = await response.json();
        setCertificate(data); // Acceder a los atributos del certificado
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCertificate();
  }, [documentId]);

  // Mostrar estado de carga
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="dark:text-gray-600 text-gray-300">
          <Loader />
        </div>
      </div>
    );
  }
  
  //if (loading) return <Loader />;

  // Mostrar error si ocurre
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black-light flex items-center justify-center">
        <div className="max-w-md w-full p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <p className="text-center text-red-600 dark:text-red-400 text-lg">{error}</p>
          <div className="mt-6 flex justify-center">
            <Link href="/" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // URL actual para compartir
  const shareUrl = `https://web.neocapitalfunding.com/certificates/verify/${documentId}`;

  // Función para copiar al portapapeles y mostrar la notificación
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Copiado al portapapeles');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-900 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl rounded-lg bg-white dark:bg-zinc-800 shadow-lg border border-gray-200 dark:border-gray-600">
        {/* Encabezado con logo */}
        <div className="flex justify-center p-6 border-b border-gray-100 dark:border-gray-700">
          <Link href="/">
            <Image
              src="/images/logo-dark.png"
              alt="NeoCapital Logo"
              width={236}
              height={60}
              className="h-8 w-auto dark:block hidden"
            />
            <Image
              src="/images/logo-light.png"
              alt="NeoCapital Logo"
              width={236}
              height={60}
              className="h-14 w-auto dark:hidden block"
            />
          </Link>
        </div>

        {/* Mensaje de verificación */}
        <div className="p-4 md:p-6">
          <div className="rounded-xl bg-green-100 p-4 text-sm text-green-700 dark:bg-green-200/20 dark:text-green-400 flex items-center shadow-sm">
            <svg
              className="mr-2 h-12 w-12 stroke-green-500 dark:stroke-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            <span className="text-sm md:text-lg">
              La autenticidad de este certificado ha sido verificada exitosamente.
            </span>
          </div>
        </div>

        {/* Sección para compartir */}
        <div className="p-4 md:p-6">
          <div className="mb-8 mt-4 w-full rounded-xl border-2 px-4 py-6 text-center border-gray-200 dark:border-gray-500 bg-gray-50 dark:bg-zinc-700/30">
            <div className="mt-2 flex items-center justify-center">
              <svg
                className="mr-2 h-6 w-6 text-gray-700 dark:text-slate-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              <h2 className="text-xl font-medium text-gray-800 dark:text-slate-200">
                Comparte esta página con otros
              </h2>
            </div>
            <div className="mt-4 text-yellow-500 break-all">{shareUrl}</div>
            <div className="mt-2 flex justify-center">
            <button
                onClick={copyToClipboard}
                className="flex w-28 justify-center rounded-xl bg-yellow-100 p-2 hover:bg-yellow-200 focus:outline-none focus:ring-4 focus:ring-yellow-200 dark:bg-yellow-500"
            >
                <svg
                  className="h-6 w-6 text-black dark:text-black"
                  viewBox="0 0 29 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.97059 1.58824H14.2941C15.6099 1.58824 16.6765 2.65485 16.6765 3.97059V6.35294H18.2647V3.97059C18.2647 1.7777 16.487 0 14.2941 0H3.97059C1.7777 0 0 1.7777 0 3.97059V14.2941C0 16.487 1.7777 18.2647 3.97059 18.2647H6.35294V16.6765H3.97059C2.65485 16.6765 1.58824 15.6099 1.58824 14.2941V3.97059C1.58824 2.65485 2.65485 1.58824 3.97059 1.58824ZM12.7059 8.73529H16.6765H18.2647H23.0294C25.2223 8.73529 27 10.513 27 12.7059V23.0294C27 25.2223 25.2223 27 23.0294 27H12.7059C10.513 27 8.73529 25.2223 8.73529 23.0294V18.2647V16.6765V12.7059C8.73529 10.513 10.513 8.73529 12.7059 8.73529ZM12.7059 10.3235C11.3901 10.3235 10.3235 11.3901 10.3235 12.7059V23.0294C10.3235 24.3452 11.3901 25.4118 12.7059 25.4118H23.0294C24.3452 25.4118 25.4118 24.3452 25.4118 23.0294V12.7059C25.4118 11.3901 24.3452 10.3235 23.0294 10.3235H12.7059Z"
                    fill="currentColor"
                  />
                </svg>
                <span className="ml-2">Copiar</span>
              </button>
            </div>
          </div>
        </div>

        {/* AQUÍ USAMOS EL COMPONENTE CERTIFICATES */}
        <div className="p-4 md:p-6">
          <div className="w-full rounded-lg">
            <Certificates certificates={certificate} />
          </div>

          {/* Imagen del certificado si es necesario */}
          {certificate?.imageUrl && (
            <img
              className="mt-8 rounded-xl w-full border border-gray-200 dark:border-gray-700 shadow-md"
              src={certificate.imageUrl}
              alt="Certificate"
            />
          )}
        </div>

        {/* Llamada a la acción */}
        <div className="p-4 md:p-6">
          <div className="m-4 mb-10 mt-10 flex flex-col rounded-xl border-2 border-transparent bg-amber-50 dark:bg-yellow-600/90 px-6 py-10 text-amber-800 dark:text-slate-100 hover:border-amber-500 dark:hover:border-yellow-500 transition-colors shadow-md">
            <div className="mt-6 text-center text-3xl font-bold">
              ¡Obtén el tuyo hoy!
            </div>
            <div className="text-md mt-3 text-center">
              Te recomendamos revisar nuestro{' '}
              <span className="font-medium">FAQ</span> antes de
              comenzar un challenge.
            </div>
            <div className="mt-10 flex flex-row justify-center gap-4">
              <Link href="https://neocapitalfunding.com/faq"> 
                <button className="rounded-lg bg-amber-500 dark:bg-slate-200 px-6 py-2 text-center text-white dark:text-amber-900 font-medium hover:bg-amber-600 dark:hover:bg-white transition-colors focus:outline-none focus:ring-4 focus:ring-amber-300 dark:focus:ring-slate-300">
                  FAQ
                </button>
              </Link>
              <Link href="/register">
                <button className="rounded-lg bg-amber-500 dark:bg-slate-200 px-6 py-2 text-center text-white dark:text-amber-900 font-medium hover:bg-amber-600 dark:hover:bg-white transition-colors focus:outline-none focus:ring-4 focus:ring-amber-300 dark:focus:ring-slate-300">
                  Crear Cuenta
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Agregamos el componente Toaster al final del documento */}
      <Toaster position="top-right" richColors />
    </div>
  );
}