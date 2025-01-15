import React from 'react';
import Navbar from "../navbar";
import { PlusIcon } from '@heroicons/react/20/solid';

import WhatsAppButton from "../../components/WhatsAppButton";

export default function Layout({ children, title, showButton, NoTab }) {
    return (
        <>
            <div className="min-h-full">

                <Navbar />

                {/* <header className="bg-white shadow-sm">

                    {!NoTab && (
                        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
                            {showButton && (
                                <a
                                    href="https://wazend.net/pricing/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                                >
                                    <PlusIcon className="h-6 w-auto" aria-hidden="true" />
                                    <span className="ml-2 hidden sm:block text-base font-medium">Contratar servicio</span>
                                </a>

                            )}
                        </div>
                    )}
                </header> */}

                <main>
                    <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">{children}</div>
                    <WhatsAppButton />
                </main>

            </div>
        </>
    );
};
