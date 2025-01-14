// NoOrdersSkeleton.js
const NoOrdersSkeleton = () => {
    return (
      <div className="flex flex-col items-center space-y-4 h-full w-full">
        {/* Caja 1 */}
        <div className="bg-gray-200 rounded-xl px-6 py-20 text-center animate-pulse w-full"></div>
        {/* Caja 2 */}
        <div className="bg-gray-200 rounded-xl px-6 py-20 text-center animate-pulse w-full"></div>
        {/* Caja 3 */}
        <div className="bg-gray-200 rounded-xl px-6 py-20 text-center animate-pulse w-full"></div>
      </div>
    );
  };
  
  export default NoOrdersSkeleton;
  