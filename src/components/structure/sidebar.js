import { HomeIcon, UserIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

const sidebarButtons = [
    { icon: HomeIcon, label: 'Botón Principal', id: 'main' },
    { icon: UserIcon, label: 'Botón 1', id: 'user' },
    { icon: Cog6ToothIcon, label: 'Botón 2', id: 'settings' },
    { icon: ArrowLeftOnRectangleIcon, label: 'Botón 3', id: 'logout' },
];

export default function Sidebar() {
    return (
        <div>

            <div className=" p-4 border-b border-gray-200">
                <button className="bg-amber-500 rounded-md text-black font-semibold px-4 py-3 w-full hover:bg-amber-600 transition duration-200">
                    Nuevo desafío NEO
                </button>

                <p className="text-black font-semibold text-lg mt-8">
                    Menú principal
                </p>
            </div>


            <div className="flex flex-col gap-2">
  {sidebarButtons.map(({ icon: Icon, label, id }) => (
    <button
      key={id}
      className="w-full flex items-center py-5 px-6 text-gray-700 font-semibold hover:bg-zinc-300 hover:text-black transition duration-200 last:rounded-b-md"
    >
      <Icon className="h-7 w-7 mr-4" />
      <p className="text-black font-medium text-md">{label}</p>
    </button>
  ))}
</div>



        </div>
    );
}
