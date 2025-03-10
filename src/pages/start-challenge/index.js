import { useStrapiData } from '../../services/strapiService';
import { useState, useEffect } from 'react';

const ChallengeRelations = () => {
    const { data: relations, error, isLoading } = useStrapiData('challenge-relations?populate=*');

    // Estados para manejar las selecciones
    const [selectedStep, setSelectedStep] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null); // Almacenamos el objeto completo del producto

    // Procesar los datos para obtener steps únicos y sus relaciones
    const stepsData = relations
        ? [...new Set(relations.map(relation => relation.challenge_step.name))].map(stepName => ({
              step: stepName,
              relations: relations.filter(relation => relation.challenge_step.name === stepName),
          }))
        : [];

    // Seleccionar el primer step, subcategoría y producto ACTIVO por defecto al cargar los datos
    useEffect(() => {
        if (stepsData.length > 0 && selectedStep === null) {
            const firstStep = stepsData[0].step;
            setSelectedStep(firstStep);

            // Seleccionar la primera subcategoría del primer step
            const firstStepRelations = stepsData[0].relations;
            if (firstStepRelations.length > 0) {
                setSelectedSubcategory(firstStepRelations[0].challenge_subcategory.name);

                // Seleccionar el primer producto ACTIVO (si existe) de la primera relación
                const firstRelationProducts = firstStepRelations[0].challenge_products;
                const firstActiveProduct = firstRelationProducts.find(product => product.isActive !== false);
                if (firstActiveProduct) {
                    setSelectedProduct(firstActiveProduct); // Almacenamos el objeto completo
                }
            }
        }
    }, [stepsData]);

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    // Función para manejar el clic en un step
    const handleStepClick = (step) => {
        setSelectedStep(step);
        // Si cambiamos de step, verificamos si la subcategoría/producto seleccionados son válidos
        const stepRelations = stepsData.find(item => item.step === step).relations;
        if (stepRelations.length > 0) {
            const validSubcategories = stepRelations.map(r => r.challenge_subcategory.name);
            if (!validSubcategories.includes(selectedSubcategory)) {
                setSelectedSubcategory(stepRelations[0].challenge_subcategory.name);

                const firstRelationProducts = stepRelations[0].challenge_products;
                const firstActiveProduct = firstRelationProducts.find(product => product.isActive !== false);
                if (firstActiveProduct) {
                    setSelectedProduct(firstActiveProduct); // Almacenamos el objeto completo
                } else {
                    setSelectedProduct(null);
                }
            }
        } else {
            setSelectedSubcategory(null);
            setSelectedProduct(null);
        }
    };

    // Función para manejar el clic en una subcategory
    const handleSubcategoryClick = (subcategory) => {
        setSelectedSubcategory(subcategory);
        // Al cambiar la subcategoría, seleccionamos el primer producto ACTIVO de la relación asociada (si existe)
        const stepRelations = stepsData.find(item => item.step === selectedStep).relations;
        const relation = stepRelations.find(r => r.challenge_subcategory.name === subcategory);
        if (relation && relation.challenge_products.length > 0) {
            const firstActiveProduct = relation.challenge_products.find(product => product.isActive !== false);
            if (firstActiveProduct) {
                setSelectedProduct(firstActiveProduct); // Almacenamos el objeto completo
            } else {
                setSelectedProduct(null);
            }
        } else {
            setSelectedProduct(null);
        }
    };

    // Función para manejar el clic en un producto
    const handleProductClick = (product) => {
        // Solo permitimos seleccionar si isActive no es false
        if (product.isActive !== false) {
            setSelectedProduct(product); // Almacenamos el objeto completo del producto
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Challenge Steps</h1>
            <div className="flex flex-wrap gap-3 mb-6">
                {stepsData.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => handleStepClick(item.step)}
                        className="focus:outline-none"
                    >
                        <div
                            className={`p-4 rounded-lg shadow-md text-center min-w-[120px] transition-transform duration-100 ${
                                selectedStep === item.step
                                    ? 'bg-blue-500 text-white scale-95'
                                    : 'bg-gray-100 hover:scale-95'
                            }`}
                        >
                            {item.step}
                        </div>
                    </button>
                ))}
            </div>

            {/* Mostrar subcategorías y productos si hay un step seleccionado */}
            {selectedStep && stepsData.length > 0 && (
                <div>
                    {/* Subcategorías */}
                    <h2 className="text-xl font-semibold mb-3">
                        Subcategories for {selectedStep}
                    </h2>
                    <div className="flex flex-wrap gap-3 mb-6">
                        {stepsData
                            .find(item => item.step === selectedStep)
                            .relations.map((relation, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSubcategoryClick(relation.challenge_subcategory.name)}
                                    className="focus:outline-none"
                                >
                                    <div
                                        className={`p-4 rounded-lg shadow-md text-center min-w-[120px] transition-transform duration-100 ${
                                            selectedSubcategory === relation.challenge_subcategory.name
                                                ? 'bg-blue-500 text-white scale-95'
                                                : 'bg-gray-100 hover:scale-95'
                                        }`}
                                    >
                                        {relation.challenge_subcategory.name}
                                    </div>
                                </button>
                            ))}
                    </div>

                    {/* Productos */}
                    {selectedSubcategory && (
                        <>
                            <h2 className="text-xl font-semibold mb-3">
                                Products for {selectedSubcategory}
                            </h2>
                            <div className="flex flex-wrap gap-3 mb-6">
                                {(() => {
                                    const stepRelations = stepsData.find(item => item.step === selectedStep).relations;
                                    const selectedRelation = stepRelations.find(
                                        r => r.challenge_subcategory.name === selectedSubcategory
                                    );

                                    if (selectedRelation && selectedRelation.challenge_products.length > 0) {
                                        return selectedRelation.challenge_products.map((product, productIndex) => (
                                            <div
                                                key={`${selectedRelation.id}-${productIndex}`}
                                                className={`p-4 rounded-lg shadow-md text-center min-w-[120px] transition-transform duration-100 ${
                                                    product.isActive !== false
                                                        ? selectedProduct && selectedProduct.name === product.name
                                                            ? 'bg-blue-500 text-white scale-95 cursor-pointer'
                                                            : 'bg-gray-100 hover:scale-95 cursor-pointer'
                                                        : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                                }`}
                                                onClick={() => product.isActive !== false && handleProductClick(product)} // Solo clickable si isActive no es false
                                            >
                                                {product.name}
                                            </div>
                                        ));
                                    } else {
                                        return (
                                            <p className="text-gray-500">
                                                No products available for this subcategory
                                            </p>
                                        );
                                    }
                                })()}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Mostrar el precio del producto seleccionado en un div grande al final */}
            {selectedProduct && (
                <div className="mt-6 p-6 bg-green-100 rounded-lg shadow-md text-center">
                    <h3 className="text-xl font-semibold mb-2">
                        Selected Product: {selectedProduct.name}
                    </h3>
                    <p className="text-2xl font-bold text-green-700">
                        Price: ${selectedProduct.precio ? selectedProduct.precio : 'N/A'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ChallengeRelations;