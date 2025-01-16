import React from 'react';
import Navbar from "../structure/navbar";
import FooterInfo from "../structure/footer";

import { PlusIcon } from '@heroicons/react/20/solid';

import WhatsAppButton from "../structure/WhatsAppButton";

export default function Layout({ children, title, showButton, NoTab }) {
    return (
        <>
            <div className="min-h-full">

                <Navbar />



                <main>


                    {/* Estructura central */}




                    <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">




                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="hidden lg:block basis-1/5 bg-blue-100">
                                {/* Columna 1 (20%) - Oculta en dispositivos móviles */}
                            </div>
                            <div className="flex-1 lg:basis-4/5 bg-green-100">
                                {/* Columna 2 (80%) */}
                                {children}
                                <FooterInfo />
                            </div>
                        </div>





                    </div>




                    <WhatsAppButton />

                </main>




            </div>
        </>
    );
};
