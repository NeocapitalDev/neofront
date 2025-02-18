import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Layout = ({ children }) => {
  return (
    <div className="relative h-screen">
      {/* Imagen de fondo ocupando todo el ancho */}
      <Image
        className="absolute inset-0 w-full h-full object-cover z-[-1] hidden sm:block"
        src="/images/bg-auth.webp"
        alt="Fondo de pantalla"
        layout="fill"
        objectFit="cover"
        priority={true} // Carga prioritaria para mejorar la experiencia
      />

      {/* Fondo negro para móviles */}
      <div className="absolute inset-0 w-full h-full bg-zinc-800 sm:hidden z-[-1]"></div>
      <div className="flex min-h-full flex-1 relative z-10">
        {/* Contenedor para la imagen de monedas */}
        <div className="relative hidden w-1/2 lg:block">
          {/* Imagen de monedas superpuesta */}
          <Image
            className="absolute inset-0 m-auto w-[70%] h-auto object-contain"
            src="/images/moneda.webp"
            alt="Moneda"
            width={960}
            height={1080}
            unoptimized={true}
          />
        </div>

        {/* Contenedor del formulario */}
        <div className="flex flex-1 w-1/2 flex-col justify-center px-8 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <Link href="/">
              <Image
                className="h-8 w-auto dark:hidden"
                src="/images/logo-light.png"
                alt="Logo"
                width={236}
                height={60}
              />
              <Image
                className="h-8 w-auto hidden dark:block"
                src="/images/logo-dark.png"
                alt="Logo"
                width={236}
                height={60}
              />
            </Link>

            <main>{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
