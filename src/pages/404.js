import Head from 'next/head';
import Link from 'next/link';

export default function Error404() {
    return (
        <>
            <Head>
            <title>{String(404 - process.env.NEXT_PUBLIC_NAME_APP || "")}</title>
            </Head>
            <div className="h-screen">
                <main className="grid min-h-full place-items-center bg-zinc-900 px-6 py-24 sm:py-32 lg:px-8">
                    <div className="text-center">
                        <p className="text-base font-bold text-amber-600">404</p>
                        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-300 sm:text-5xl">Página no encontrada</h1>
                        <p className="mt-6 text-base leading-7 text-gray-300">La página que estás buscando no existe o ha sido movida</p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Link href="/"
                            className="rounded-md bg-amber-500 px-3.5 py-2.5 text-sm font-semibold text-black shadow-sm hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                            >
                                    Volver al inicio
                        </Link>
                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}

