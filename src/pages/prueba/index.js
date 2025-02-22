"use client";

import { useEffect, useState } from "react";

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function fetchProducts() {
        try {
            const response = await fetch("http://localhost:1337/api/products?populate=*", {
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
                },
            });
            if (!response.ok) {
                throw new Error("Error al obtener los productos");
            }
            const data = await response.json();
            setProducts(data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProducts();
    }, []);

    if (loading) return <p>Cargando productos...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="border-gray-200 border-2 dark:border-zinc-800 dark:shadow-black bg-white rounded-md shadow-md dark:bg-zinc-800 dark:text-white p-4">
            {products.map((product) => (
                <div key={product.id} className="p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold">{product.name}</h2>
                    <p>Precio: ${product.price}</p>
                    <p>ID de WooCommerce: {product.woocommerce_product_id}</p>
                    <p>Etiqueta del desafío: {product.challenge_tag}</p>
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold">Condiciones del desafío:</h3>
                        <table className="w-full border-collapse border border-gray-300 mt-2">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-gray-700">
                                    <th className="border border-gray-300 p-2">ID Documento</th>
                                    <th className="border border-gray-300 p-2">Tipo</th>
                                    <th className="border border-gray-300 p-2">Periodo</th>
                                    <th className="border border-gray-300 p-2">Drawdown Relativo (%)</th>
                                    <th className="border border-gray-300 p-2">Drawdown Absoluto (%)</th>
                                    <th className="border border-gray-300 p-2">Beneficio Absoluto (%)</th>
                                    <th className="border border-gray-300 p-2">Paso</th>
                                </tr>
                            </thead>
                            <tbody>
                                {product.challenge_conditions.map((condition) => (
                                    <tr key={condition.id} className="text-center border border-gray-300">
                                        <td className="border border-gray-300 p-2">{condition.documentId}</td>
                                        <td className="border border-gray-300 p-2">{condition.type}</td>
                                        <td className="border border-gray-300 p-2">{condition.period}</td>
                                        <td className="border border-gray-300 p-2">{condition.relativeDrawdownThreshold}%</td>
                                        <td className="border border-gray-300 p-2">{condition.absoluteDrawdownThreshold}%</td>
                                        <td className="border border-gray-300 p-2">{condition.absoluteProfitThreshold}%</td>
                                        <td className="border border-gray-300 p-2">{condition.step}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
}