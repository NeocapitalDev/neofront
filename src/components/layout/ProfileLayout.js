import Layout from './dashboard';
import { UserCircleIcon, Cog6ToothIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';

export default function Profile({ children }) {
  const router = useRouter();
  const currentRoute = router.pathname;

  // Lista de botones con información de cada uno
  const menuItems = [
    { name: 'General', icon: UserCircleIcon, path: '/profile' },
    { name: 'Preferencias', icon: Cog6ToothIcon, path: '/profile/preferences' },
    { name: 'Facturas', icon: DocumentTextIcon, path: '/profile/invoices' },
  ];

  return (
    <>
      <Layout title="Perfil">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Primera columna: Menú de navegación */}
          <div className="w-full md:w-1/3">
          <p className="text-xs font-semibold text-gray-500 px-2 pb-3 w-full">MI CUENTA</p>
            <div className="flex flex-col gap-2">
              {menuItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => router.push(item.path)}
                  className={`w-full px-2 py-2.5 text-left text-sm font-medium rounded-md flex items-center gap-x-2 ${
                    currentRoute === item.path 
                      ? 'bg-gray-200 text-emerald-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className={`h-6 w-6 ${currentRoute === item.path ? 'text-emerald-700' : 'text-gray-700'}`} strokeWidth="2" />
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Contenido de la sección */}
          <div className="w-full md:w-3/4">
            {children}
          </div>
          
        </div>
      </Layout>
    </>
  );
}
