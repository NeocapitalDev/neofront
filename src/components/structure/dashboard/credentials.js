import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ClipboardDocumentIcon, PencilIcon, KeyIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function CredencialesModal() {
    const [open, setOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar la contraseña

    const data = [
        { label: 'Login', value: '1420126402' },
        { label: 'Contraseña', value: 'asAS*9@Pa9' },
        { label: 'Contraseña de solo lectura', value: 'YrI*9@IqHa9' },
        { label: 'Servidor', value: 'FTMO-Demo2' },
        { label: 'Plataforma', value: 'MT4' },
    ];

    const handleCopy = (value) => {
        navigator.clipboard.writeText(value); // Copia el valor al portapapeles sin alertas
    };

    return (
        <div>
            {/* Botón para abrir el modal */}
            <button
                className="flex items-center justify-center space-x-2 px-2 py-1 border rounded-sm shadow-md bg-gray-0 hover:bg-gray-200 w-auto"
                onClick={() => setOpen(true)}
            >
                <KeyIcon className="h-6 w-6 text-gray-600" />
                <span className="text-xs lg:text-sm">Credenciales</span>
            </button>

            {/* Modal */}
            <Transition.Root show={open} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={setOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl sm:p-6">
                                    <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                                        <button
                                            type="button"
                                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                                            onClick={() => setOpen(false)}
                                        >
                                            <span className="sr-only">Cerrar</span>
                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>

                                    <div className="mt-3 sm:mt-0">
                                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 border-b pb-5 text-gray-900 text-left mb-4">
                                            Credenciales de inicio de sesion
                                        </Dialog.Title>

                                        {/* Tabla de credenciales */}
                                        <div className="">
                                            {data.map((item, index) => {
                                                const isLast = index === data.length - 1;




                                                return (
                                                    <div
                                                        key={index}
                                                        className={`flex items-center ${!isLast ? 'justify-between' : ''} ${!isLast && 'border-b'} pb-2`}
                                                    >
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {item.label}:
                                                        </div>
                                                
                                                        <div className={`flex items-center py-1 ${!isLast ? 'space-x-20' : 'space-x-2'}`}>
                                                            {/* Contraseña principal con opción de ocultar */}
                                                            {item.label === 'Contraseña' ? (
                                                                <div className="flex items-center space-x-1">
                                                                    <span className="text-sm text-gray-600">
                                                                        {showPassword ? item.value : '********'}
                                                                    </span>
                                                                    <button
                                                                        className="flex items-center justify-center"
                                                                        onClick={() => setShowPassword(!showPassword)}
                                                                    >
                                                                        {showPassword ? (
                                                                            <EyeSlashIcon className="h-5 w-5 text-gray-600" />
                                                                        ) : (
                                                                            <EyeIcon className="h-5 w-5 text-gray-600" />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                isLast ? (
                                                                    <span className="text-md font-bold text-gray-900">{item.value}</span>
                                                                ) : (
                                                                    <span className="text-sm text-gray-600">{item.value}</span>
                                                                )
                                                            )}
                                                
                                                            {!isLast && (
                                                                <div className="flex flex-col space-y-2 w-[120px]">
                                                                    {/* Botón de copiar */}
                                                                    <div className="flex items-center space-x-3">
                                                                        <button
                                                                            className="p-2 bg-white rounded border hover:bg-gray-200 w-12 h-12 flex items-center justify-center"
                                                                            onClick={() => handleCopy(item.value)}
                                                                        >
                                                                            <ClipboardDocumentIcon className="h-5 w-5 text-gray-600" />
                                                                        </button>
                                                                        <span className="text-sm text-gray-600 truncate">Copiar</span>
                                                                    </div>
                                                
                                                                    {/* Botón de cambio */}
                                                                    {['Contraseña', 'Contraseña de solo lectura'].includes(item.label) && (
                                                                        <div className="flex items-center space-x-3">
                                                                            <button
                                                                                className="p-2 border bg-white rounded hover:bg-gray-200 w-12 h-12 flex items-center justify-center"
                                                                            >
                                                                                <PencilIcon className="h-5 w-5 text-gray-600" />
                                                                            </button>
                                                                            <span className="text-sm text-gray-600 truncate">Cambio</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                                





                                            })}

                                        </div>
                                    </div>

                                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                        <button
                                            type="button"
                                            className="inline-flex w-full justify-center rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 sm:ml-3 sm:w-auto"
                                            onClick={() => setOpen(false)}
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </div>
    );
}
