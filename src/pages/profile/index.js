import { useState } from 'react';  // Importamos useState
import User from './User';
import Account from './account/index';
import Identity from './identity/index';
import Security from './security/index';
import Layout from '../../components/layout/dashboard';

const tabs = [
  { name: 'Información Personal', href: '/profile', current: true },
  { name: 'Información de Cuenta', href: '/profile/account', current: false },
  { name: 'Seguridad', href: '/profile/security', current: false },
  { name: 'FTMO Identity', href: '/profile/identity', current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Index() {
  // Definir el estado para manejar la pestaña activa
  const [currentTab, setCurrentTab] = useState(tabs[0]);

  // Función para actualizar el tab activo
  const handleTabClick = (tab) => {
    setCurrentTab(tab);
  };

  return (
    <Layout title="Perfil" NoTab={true}>
      <div className="space-y-6">
        {/* Tabs Component */}
        <div className='p-6 dark:bg-zinc-800 border-gray-200 border-2 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-800 dark:shadow-black'>
          <div className="sm:hidden">
            <label htmlFor="tabs" className="sr-only">
              Select a tab
            </label>
            <select
              id="tabs"
              name="tabs"
              className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              value={currentTab.name}
              onChange={(e) => handleTabClick(tabs.find(tab => tab.name === e.target.value))}
            >
              {tabs.map((tab) => (
                <option key={tab.name} value={tab.name}>
                  {tab.name}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden sm:block">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex" aria-label="Tabs">
                {tabs.map((tab) => (
                  <a
                    key={tab.name}
                    onClick={(e) => {
                      e.preventDefault();  // Evitar el comportamiento por defecto de los enlaces
                      handleTabClick(tab);  // Actualizar la pestaña activa
                    }}
                    className={classNames(
                      tab.name === currentTab.name
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                      'w-1/4 border-b-2 py-4 px-1 text-center text-sm font-medium'
                    )}
                    href="#"
                  >
                    {tab.name}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Conditionally Rendered Components Based on Active Tab */}
        <div className="mt-6">
          {currentTab.name === 'Información Personal' && <User />}
          {currentTab.name === 'Información de Cuenta' && <Account />}
          {currentTab.name === 'Seguridad' && <Security />}
          {currentTab.name === 'FTMO Identity' && <Identity />}
        </div>
      </div>
    </Layout>
  );
}

export default Index;
