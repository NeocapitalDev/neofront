// src/pages/dashboard/neoCard.js
import Link from 'next/link';
import { CheckIcon } from '@heroicons/react/24/solid';

export default function NeoChallengeCard() {
    return (
        <div className="p-6 bg-white dark:bg-zinc-800 text-gray-800 dark:text-white rounded-lg shadow-md border border-gray-200 dark:border-zinc-700 w-full mx-auto">
            <div className="flex flex-col items-center text-center">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-400 dark:to-amber-500 text-transparent bg-clip-text">NEO CHALLENGE</h2>
                <p className="text-[var(--app-primary)] mt-2 font-medium">Opere hasta $200,000 en la NEO Account</p>
                <p className="text-sm mt-4 text-gray-600 dark:text-gray-300">Demuestre sus habilidades de trading. ¡Apruebe el curso de evaluación y reciba la NEO Account!</p>
            </div>
            
            {/* Lista de características alineada a la izquierda en móviles y centrada en pantallas grandes */}
            <div className="w-full mt-6 flex justify-start md:justify-center pr-0 md:pr-48">
                <div className="space-y-3 flex flex-col items-start max-w-md">
                    <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0 bg-amber-50 dark:bg-amber-900/20 p-1 rounded-full">
                            <CheckIcon className="h-4 w-4 text-[var(--app-primary)]" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-200">Le facilitaremos una NEO Account de hasta $200,000 USD</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0 bg-amber-50 dark:bg-amber-900/20 p-1 rounded-full">
                            <CheckIcon className="h-4 w-4 text-[var(--app-primary)]" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-200">Demuestre sus habilidades de trading</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0 bg-amber-50 dark:bg-amber-900/20 p-1 rounded-full">
                            <CheckIcon className="h-4 w-4 text-[var(--app-primary)]" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-200">Análisis completo de cuenta</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0 bg-amber-50 dark:bg-amber-900/20 p-1 rounded-full">
                            <CheckIcon className="h-4 w-4 text-[var(--app-primary)]" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-200">Aplicaciones Premium</span>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 text-center">
                <Link href="/start-challenge">
                    <button className="px-6 py-3 w-full bg-[var(--app-primary)] text-white dark:text-black font-semibold rounded-lg shadow-md hover:bg-amber-600 dark:hover:bg-[var(--app-secondary)] transition-colors">
                        Iniciar NEO Challenge
                    </button>
                </Link>

            </div>
        </div>
    );
}