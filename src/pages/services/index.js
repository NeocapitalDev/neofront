import Layout from '../../components/layout/dashboard';
import Link from 'next/link';
import { useRouter } from 'next/router';

import ServiceList from './ServiceList';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function Index() {
    const router = useRouter();

    return (
        <Layout title="Dashboard" showButton={true}>

            <div className="flex space-x-4">
                {/* Enlace Mis Servicios */}
                <Link
                    href="/"
                    className={classNames(
                        "px-4 py-2 border rounded-full text-sm transition duration-300",
                        router.pathname === "/"
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-transparent text-emerald-700 border-emerald-600 hover:bg-emerald-100 hover:border-emerald-500"
                    )}
                >
                    Mis instancias
                </Link>

                {/* Enlace Otros Servicios */}
                <Link
                    href="/services"
                    className={classNames(
                        "px-4 py-2 border rounded-full text-sm transition duration-300",
                        router.pathname === "/services"
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-transparent text-emerald-700 border-emerald-600 hover:bg-emerald-100 hover:border-emerald-500"
                    )}
                >
                    Otros servicios
                </Link>
            </div>

            <div className="mt-8">
                <ServiceList />
            </div>


        </Layout>
    );
}
