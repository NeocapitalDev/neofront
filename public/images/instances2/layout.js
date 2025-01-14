import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import Configurations from './Configurations';

function Layout() {
  // Estado que define el componente activo; por defecto "dashboard"
  const [activeComponent, setActiveComponent] = useState('dashboard');

  let Content;
  if (activeComponent === 'dashboard') {
    Content = <Dashboard />;
  } else if (activeComponent === 'sub-settings2') {
    Content = <Configurations />;
  }

  return (
    <div className='flex h-screen'>
      <Sidebar
        activeComponent={activeComponent}
        setActiveComponent={setActiveComponent}
      />
      <main className='flex-1 overflow-y-auto'>{Content}</main>
    </div>
  );
}

export default Layout;
