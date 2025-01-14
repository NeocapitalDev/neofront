'use client';
import { useState } from 'react';
import {
  LayoutDashboard,
  Settings2,
  FileCode,
  ChevronDown,
} from 'lucide-react';

const sidebarItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    id: 'dashboard',
  },
  {
    title: 'Configurations',
    icon: Settings2,
    id: 'configurations',
    subItems: [
      { title: 'Settings', id: 'sub-settings2' },
      { title: 'Proxy', id: 'proxy' },
    ],
  },
  {
    title: 'Documentation',
    icon: FileCode,
    id: 'documentation',
  },
];

function Sidebar({ activeComponent, setActiveComponent }) {
  const [expandedSections, setExpandedSections] = useState(['configurations']);

  const toggleSection = (sectionId) => {
    const section = sidebarItems.find((item) => item.id === sectionId);

    // Solo permitir toggle si tiene subItems
    if (section?.subItems) {
      setExpandedSections((prev) =>
        prev.includes(sectionId)
          ? prev.filter((id) => id !== sectionId)
          : [...prev, sectionId]
      );
    }
  };

  return (
    <div className='w-64 border-r h-screen bg-slate-100'>
      <nav className='space-y-2 p-4'>
        {sidebarItems.map((item) => (
          <div key={item.title}>
            {/* Botón principal */}
            <button
              className={`flex w-full items-center justify-between gap-x-2 text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-200 ${
                activeComponent === item.id && 'bg-slate-200'
              }`}
              onClick={() =>
                item.subItems
                  ? toggleSection(item.id)
                  : setActiveComponent(item.id)
              }
            >
              <span className='flex items-center gap-x-2'>
                <item.icon className='h-4 w-4' />
                {item.title}
              </span>
              {item.subItems && (
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    expandedSections.includes(item.id) ? 'rotate-180' : ''
                  }`}
                />
              )}
            </button>

            {/* Subitems */}
            {item.subItems && expandedSections.includes(item.id) && (
              <div className='ml-6 mt-2 space-y-1'>
                {item.subItems.map((subItem) => (
                  <button
                    key={subItem.id}
                    className={`flex w-full items-center text-sm px-3 py-1 rounded-lg hover:bg-slate-200 ${
                      activeComponent === subItem.id && 'bg-slate-200'
                    }`}
                    onClick={() => setActiveComponent(subItem.id)}
                  >
                    {subItem.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;
