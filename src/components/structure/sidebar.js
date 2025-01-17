import Link from 'next/link';
import { useRouter } from 'next/router';
import { navigation } from './links'; // Importar desde links.js

export default function Sidebar() {
    const router = useRouter();

    return (
        <div>
            <div className="p-4 border-b border-gray-200">
                <button className="bg-amber-500 rounded-md text-black font-semibold px-4 py-3 w-full hover:bg-amber-600 transition duration-200">
                    Nuevo desafío NEO
                </button>

                <p className="text-black font-semibold text-lg mt-8">
                    Menú principal
                </p>
            </div>

            <div className="flex flex-col">
                {navigation.map(({ icon: Icon, name, id, href }) => (
                    <Link
                        href={href}
                        key={id}
                        className={`w-full flex items-center py-7 px-6 font-semibold transition duration-200 last:rounded-b-md relative ${
                            router.pathname === href
                                ? 'bg-gradient-to-r from-amber-50 via-white to-transparent border-l-4 border-amber-500'
                                : 'hover:bg-zinc-300'
                        }`}
                    >
                        <div
                            className={`absolute inset-0 ${
                                router.pathname === href
                                    ? 'opacity-100'
                                    : 'opacity-0 hover:opacity-50'
                            } transition-opacity duration-200`}
                            style={{
                                clipPath: 'polygon(0 0, 90% 0, 10% 100%, 0 100%)',
                            }}
                        ></div>
                        <Icon
                            className={`h-7 w-7 mr-4 z-10 ${
                                router.pathname === href
                                    ? 'text-amber-500'
                                    : 'text-gray-700'
                            }`}
                        />
                        <p
                            className={`text-md z-10 font-medium ${
                                router.pathname === href
                                    ? 'text-amber-500'
                                    : 'text-gray-700'
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
