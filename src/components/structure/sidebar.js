// src/components/structure/sidebar.js
import Link from 'next/link';
import { useRouter } from 'next/router';
import { navigation } from './links'; // Importar desde links.js
import { principalButton } from './links';

export default function Sidebar() {
    const router = useRouter();

    return (
        <div
            className="relative dark:bg-zinc-800  h-full w-32 rounded-xl border-2 dark:border-0 dark:border-zinc-700 dark:shadow-black border-gray-200 dark:text-white"
            style={{ minWidth: '16rem' }} // Asegurar un ancho fijo
        >
            <div className="p-4 border-b border-gray-200 dark:border-zinc-700">
                {/* Aquí se utiliza el nuevo componente con los props correspondientes */}
                <Link href={principalButton[0].href} passHref>
                    <button className="bg-[var(--app-primary)] rounded-md text-white font-semibold px-4 py-3 w-full hover:bg-[var(--app-secondary)] transition duration-200">
                        {principalButton[0].name}
                    </button>
                </Link>

                <p className="text-black dark:text-white font-semibold text-lg mt-8">
                    Menú principal
                </p>
            </div>

            <div className="flex flex-col">
                {navigation.map(({ icon: Icon, name, id, href }) => (
                    <Link
                        href={href}
                        key={id}
                        className={`w-full flex items-center py-7 px-6 font-semibold transition duration-200 last:rounded-b-md relative h-16 text-sm
            ${router.pathname === href
                                ? 'bg-gradient-to-r from-amber-50 via-white to-transparent border-l-4 border-[var(--app-primary)] dark:bg-gradient-to-r dark:from-amber-800 dark:via-zinc-800 dark:to-transparent dark:border-l-4 dark:border-[var(--app-primary)]'
                                : 'hover:bg-zinc-300 dark:hover:bg-zinc-700'
                            }`}
                    >
                        <div
                            className={`absolute inset-0 ${router.pathname === href
                                ? 'opacity-100'
                                : 'opacity-0 hover:opacity-50'
                                } transition-opacity duration-200`}
                            style={{
                                clipPath: 'polygon(0 0, 90% 0, 10% 100%, 0 100%)',
                            }}
                        ></div>
                        <Icon
                            className={`h-6 w-6 mr-4 z-10 ${router.pathname === href
                                ? 'text-[var(--app-primary)] dark:text-[var(--app-primary)]'
                                : 'text-gray-700 dark:text-gray-300'
                                }`}
                        />
                        <p
                            className={`text-md z-10 font-medium ${router.pathname === href
                                ? 'text-[var(--app-primary)] dark:text-[var(--app-primary)]'
                                : 'text-gray-700 dark:text-white'
                                }`}
                        >
                            {name}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
