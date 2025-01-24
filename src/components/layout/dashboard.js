import Navbar from "../structure/navbar";
import FooterInfo from "../structure/footer";
import Sidebar from '../structure/sidebar';
import Breadcrumb from "../Breadcrumb";

export default function Layout({ children }) {
    return (
        <div className="min-h-full">
            <Navbar />
            <main className="text-black dark:text-white">

                {/* Estructura central */}
                <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="hidden lg:block w-[300px] dark:shadow-black h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                            {/* Columna 1 (Sidebar) */}
                            <Sidebar />
                        </div>
                        <div className="flex-1">
                            {/* Columna 2 (Contenido) */}
                            {/*<Breadcrumb />*/}
                            {children}
                            <FooterInfo />
                        </div>
                    </div>
                </div>



            </main>
        </div>
    );
}
