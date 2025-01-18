const LoaderSkeleton = () => {
    return (
      <div className="flex-col gap-4 w-full flex items-center justify-center">
        <div className="w-28 h-28 border-8 text-amber-400 text-4xl animate-spin border-gray-300 flex items-center justify-center border-t-amber-400 rounded-full">
        <img 
            src="/images/icon-dark.png" 
            alt="Cargando" 
            className="w-14 h-14 bg-transparent"/>
        </div>
      </div>
    );
  };
  
  export default LoaderSkeleton;