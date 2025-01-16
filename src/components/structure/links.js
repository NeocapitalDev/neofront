// links.js   parte general q contendra todos los arrays necesarios
import { HomeIcon, UserIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

export const sidebarButtons = [
    { icon: HomeIcon, label: 'Botón Principal', id: 'main', link: '/' },
    { icon: UserIcon, label: 'Perfil', id: 'profile', link: '/profile' },
    { icon: Cog6ToothIcon, label: 'Botón 2', id: 'settings', link: '/settings' },
    { icon: ArrowLeftOnRectangleIcon, label: 'Botón 3', id: 'logout', link: '/logout' },
];

export const navigation = [
    { name: 'Prueba gratis', href: '/trial', trial: true },
    { name: 'Dashboard', href: '/' },
    { name: 'API Docs', href: 'https://docs.wazend.net/', external: true },
    { name: 'Integraciones', href: '/integrations' },
];

export const userNavigation = [
    { name: 'Tu perfil', href: '/profile' },
    { name: 'Facturación', href: 'https://wazend.net/my-account', external: true },
    { name: 'Cerrar sesión', href: '/', signOut: true },
];
