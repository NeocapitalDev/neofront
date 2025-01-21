import React from 'react';
import Navbar from "../structure/navbar";
import FooterInfo from "../structure/footer";
import Sidebar from '../structure/sidebar';


import WhatsAppButton from "../structure/WhatsAppButton";
import Breadcrumb from '../Breadcrumb';

export default function Layout({ children, title, showButton, NoTab }) {
    return (
        <div className="min-h-full">
            <Navbar />
            <main>
                {/* Estructura central */}
                <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="hidden lg:block lg:basis-1/4 h-full bg-white rounded-xl shadow-lg">
                            {/* Columna 1 (Sidebar) */}
                            <Sidebar />
                        </div>

                        <div className="flex-1 lg:basis-3/4">
                            <Breadcrumb />
                            {/* Contenido principal */}
                            {children}
                            <FooterInfo />
                        </div>
                    </div>
                </div>
                <WhatsAppButton />
            </main>
        </div>
    );
};
