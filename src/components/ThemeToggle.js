// components/theme-toggle.tsx
'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    useEffect(() => {
        // Verificar el tema almacenado en localStorage al cargar la página
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            setIsDarkMode(storedTheme === 'dark');
            document.body.classList.toggle('dark', storedTheme === 'dark');
        } else {
            // Si no hay valor en localStorage, establecer tema por defecto
            const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDarkMode(isDark);
            document.body.classList.toggle('dark', isDark);
        }
    }, []);

    const handleThemeToggle = () => {
        const newTheme = !isDarkMode ? 'dark' : 'light';
        setIsDarkMode(!isDarkMode);
        document.body.classList.toggle('dark', newTheme === 'dark');
        localStorage.setItem('theme', newTheme); // Guardar la preferencia en localStorage
    };

    return (
        <div className="h-16 w-full flex justify-center items-center mt-8 pb-9">
            <button
                onClick={handleThemeToggle}
                className="h-10 w-10 rounded-full flex justify-center items-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition duration-300"
            >
                <svg
                    className="fill-violet-700 block dark:hidden h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                </svg>
                <svg
                    className="fill-yellow-500 hidden dark:block h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                        fillRule="evenodd"
                        clipRule="evenodd"
                    ></path>
                </svg>
            </button>
        </div>
    );
}