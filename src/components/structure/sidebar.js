import { useRouter } from 'next/router';
import { sidebarButtons } from './links';



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

            <div className="flex flex-col gap-0">
                {sidebarButtons.map(({ icon: Icon, label, id, link }) => (
                    <button
                        key={id}
                        className={`w-full flex items-center py-7 px-6 text-gray-700 font-semibold hover:bg-zinc-300 hover:text-black transition duration-200 last:rounded-b-md ${router.pathname === link ? 'bg-zinc-200 border-l-4 border-amber-500' : ''}`}
                        onClick={() => router.push(link)}
                    >
                        <Icon className="h-7 w-7 mr-4" />
                        <p className="text-black font-medium text-md">{label}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}
