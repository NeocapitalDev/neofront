export default function BarraWinLose({winPercentage, losePercentage }) {
    return (
        /* Barra de progreso combinada */
        <div className="mt-6">
            <p className="text-lg font-semibold mb-4">Progreso de Win/Lose</p>
            <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700 h-6 relative">
                {/* Porcentaje de Wins */}
                <div
                    className="absolute top-0 left-0 h-full bg-amber-500 rounded-l-xl text-xs font-medium text-center text-blue-100 flex items-center justify-center"
                    style={{ width: `${winPercentage}%` }}
                >
                    {winPercentage}% Wins
                </div>
                {/* Porcentaje de Losses */}
                <div
                    className="absolute top-0 h-full bg-red-600 rounded-r-full text-xs font-medium text-center text-red-100 flex items-center justify-center"
                    style={{
                        left: `${winPercentage}%`,
                        width: `${losePercentage}%`,
                    }}
                >
                    {losePercentage}% Losses
                </div>
            </div>
        </div>
    );
}