import { useState, useEffect } from 'react';
import Layout from '../../components/layout/dashboard';
import User from '../../pages/profile/User';

const tabs = [
  { name: 'Información Personal', href: '/profile', current: false },
  { name: 'Información de Cuenta', href: '/profile/account', current: false },
  { name: 'Seguridad', href: '/profile/security', current: false },
  { name: 'FTMO Identity', href: '/profile/identity', current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Index({ children }) {
  const [currentTab, setCurrentTab] = useState(tabs[0]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Aseguramos que estamos en el cliente (navegador)
    setIsClient(true);
    const currentPath = window.location.pathname;
    const selectedTab = tabs.find((tab) => tab.href === currentPath);
    if (selectedTab) {
      setCurrentTab(selectedTab);
    }
  }, []); // Se ejecuta solo una vez cuando el componente se monta

  const handleTabClick = (tab) => {
    setCurrentTab(tab);
    window.location.href = tab.href; // Cambiar la URL directamente
  };

  // Solo mostramos contenido si estamos en el cliente (navegador)
  if (!isClient) {
    return null;
  }

  return (
    <Layout title="Perfil" NoTab={true}>
      {/* Tabs */}
      <div className="p-6 dark:bg-zinc-800 border-gray-200 border-2 shadow-md rounded-lg dark:text-white dark:border-zinc-800 dark:shadow-black">
        {/* Mobile View */}
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">
            Select a tab
          </label>
          <select
            id="tabs"
            name="tabs"
            className="block dark:bg-zinc-800 w-full rounded-md border-gray-300 focus:border-amber-400 focus:ring-amber-400"
            value={currentTab.name}
            onChange={(e) => handleTabClick(tabs.find((tab) => tab.name === e.target.value))}
          >
            {tabs.map((tab) => (
              <option key={tab.name} value={tab.name}>
                {tab.name}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop View */}
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={(e) => {
                    e.preventDefault(); // Evitamos la acción por defecto de los enlaces
                    handleTabClick(tab); // Actualizamos el tab activo
                  }}
                  className={classNames(
                    tab.href === currentTab.href
                      ? 'border-amber-400 text-amber-500'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                    'w-1/4 border-b-2 py-4 px-1 text-center text-sm font-medium'
                  )}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="tab-content pt-5">
        {/* Mostrar el componente User por defecto si la ruta es '/profile' */}
        {window.location.pathname === '/profile' ? <User /> : children}
      </div>
    </Layout>
  );
}

export default Index;
