import Link from 'next/link';
import { CheckIcon } from '@heroicons/react/24/solid';

export default function NeoChallengeCard() {
    return (
        <div className="p-6 bg-zinc-800 text-white rounded-lg shadow-md w-full mx-auto">
            <div className="flex flex-col items-center text-center">
                <h2 className="text-2xl font-bold">NEO CHALLENGE</h2>
                <p className="text-amber-400 mt-2">Opere hasta $200,000 en la NEO Account</p>
                <p className="text-sm mt-4">Demuestre sus habilidades de trading. ¡Apruebe el curso de evaluación y reciba la NEO Account!</p>
            </div>
            <div className="mt-6 space-y-3">
                <div className="flex items-center space-x-2">
                    <CheckIcon className="h-5 w-5 text-amber-400" />
                    <span>Le facilitaremos una NEO Account de hasta $200,000 USD</span>
                </div>
                <div className="flex items-center space-x-2">
                    <CheckIcon className="h-5 w-5 text-amber-400" />
                    <span>Demuestre sus habilidades de trading</span>
                </div>
                <div className="flex items-center space-x-2">
                    <CheckIcon className="h-5 w-5 text-amber-400" />
                    <span>Análisis completo de cuenta</span>
                </div>
                <div className="flex items-center space-x-2">
                    <CheckIcon className="h-5 w-5 text-amber-400" />
                    <span>Aplicaciones Premium</span>
                </div>
            </div>
            <div className="mt-6 text-center">
                <Link href="/start-challenge">
                    <button className="px-6 py-3 w-full bg-amber-500 text-black font-semibold rounded-lg shadow-md hover:bg-amber-600 transition">
                        Iniciar NEO Challenge
                    </button>
                </Link>
            </div>
        </div>
    );
}
