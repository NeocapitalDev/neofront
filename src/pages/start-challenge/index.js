/* src/pages/start-challenge/index.js */
import { useStrapiData } from '../../services/strapiService';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckIcon, ChevronRightIcon, InformationCircleIcon, TicketIcon } from '@heroicons/react/20/solid';
import classNames from 'classnames';
import { useStrapiData as strapiJWT } from 'src/services/strapiServiceJWT';
import useSWR from 'swr';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import Loader from '../../components/loaders/loader';
import { useSession, signIn } from "next-auth/react";
// Helper function to create a WooCommerce API instance
const createWooCommerceApi = (url, consumerKey, consumerSecret, version = 'wc/v3') => {
  if (!url) throw new Error('URL no proporcionada para WooCommerce API');
  if (!consumerKey || !consumerSecret) {
    throw new Error('Credenciales de WooCommerce no proporcionadas (consumerKey o consumerSecret)');
  }

  return new WooCommerceRestApi({
    url,
    consumerKey,
    consumerSecret,
    version,
    timeout: 10000,
  });
};

// Fetcher function for WooCommerce API
const wooFetcher = async ([endpoint, config]) => {
  try {
    const url = config.url || process.env.NEXT_PUBLIC_WOOCOMMERCE_URL || process.env.NEXT_PUBLIC_WP_URL;
    const consumerKey = config.consumerKey ||
      process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY ||
      process.env.NEXT_PUBLIC_WC_CONSUMER_KEY;
    const consumerSecret = config.consumerSecret ||
      process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET ||
      process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET;

    if (!url) throw new Error('URL de WordPress no configurada');
    if (!consumerKey || !consumerSecret) {
      throw new Error('Credenciales de WooCommerce no configuradas (consumer key/secret)');
    }

    const api = createWooCommerceApi(url, consumerKey, consumerSecret, config.version || 'wc/v3');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;

    const response = await api.get(cleanEndpoint, config.params || {});
    if (!response || !response.data) {
      throw new Error('Respuesta vacía de WooCommerce');
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`Error de WooCommerce API: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      throw new Error('Timeout o error de conexión con la API de WooCommerce');
    } else {
      throw new Error(`Error en la solicitud a WooCommerce: ${error.message}`);
    }
  }
};

const ChallengeRelations = () => {
  console.log('ChallengeRelations');
  const { data: relations, error, isLoading } = useStrapiData('challenge-relations?populate=*');
  console.log('relations', relations);
  const { data: allproducts, error: allproductserror, isLoading: allproductsisLoading } = useStrapiData('challenge-products');

  const { data: session, status } = useSession();
  console.log('session', session);
  const { data: user, status: statusUser } = strapiJWT('users/me', session?.jwt || '');
  console.log('user', user);
  // Estados para manejar las selecciones, cupón y términos
  const [selectedStep, setSelectedStep] = useState(null);
  const [selectedRelationId, setSelectedRelationId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedRelation, setSelectedRelation] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [cancellationAccepted, setCancellationAccepted] = useState(false);

  // Procesar los datos para obtener steps únicos y sus relaciones
  const stepsData = relations
    ? [...new Set(relations.map(relation => relation.challenge_step.name))].map(stepName => ({
      step: stepName,
      relations: relations.filter(relation => relation.challenge_step.name === stepName),
    }))
    : [];

  // Seleccionar el primer step, relación y producto por defecto al cargar los datos
  useEffect(() => {
    if (stepsData.length > 0 && selectedStep === null) {
      const firstStep = stepsData[0].step;
      setSelectedStep(firstStep);

      const firstStepRelations = stepsData[0].relations;
      if (firstStepRelations.length > 0) {
        setSelectedRelationId(firstStepRelations[0].id);
        setSelectedRelation(firstStepRelations[0]);

        const firstRelationProducts = firstStepRelations[0].challenge_products;
        if (firstRelationProducts.length > 0) {
          setSelectedProduct(firstRelationProducts[0]);
        }
      }
    }
  }, [stepsData]);

  // WooCommerce variations fetching logic
  console.log("Selected Product:", selectedProduct);

  // Set the endpoint only if selectedProduct and WoocomerceId are valid (fixed typo)
  const endpoint = selectedProduct && selectedProduct.WoocomerceId
    ? `products/${selectedProduct.WoocomerceId}/variations?per_page=100`
    : null;

  // Check for credentials
  const consumerKey = process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY ||
    process.env.NEXT_PUBLIC_WC_CONSUMER_KEY;
  const hasCredentials = !!consumerKey;
  const shouldFetch = endpoint && hasCredentials;

  // Use useSWR unconditionally to fetch variations
  const {
    data: productsvariations,
    error: productsErrorvariations,
    isLoading: productsLoadingvariations,
  } = useSWR(
    shouldFetch ? [endpoint, {}] : null,
    wooFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  console.log("Productos variaciones:", productsvariations);

  // Find the matching variation based on selectedStep and selectedRelation.challenge_subcategory.name
  const matchingVariation = productsvariations?.find(variation =>
    variation.attributes.some(attr => attr.name === "step" && attr.option.toLowerCase() === selectedStep?.toLowerCase()) &&
    variation.attributes.some(attr => attr.name === "subcategory" && attr.option.toLowerCase() === selectedRelation?.challenge_subcategory.name.toLowerCase())
  );

  console.log("Matching Variation:", matchingVariation);


  {/*if (isLoading || allproductsisLoading) return <p className="text-white">Loading...</p>;*/ }
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) return <p className="text-red-500">Error: {error.message}</p>;
  if (allproductserror) return <p className="text-red-500">Error: {allproductserror.message}</p>;

  // Función para manejar el clic en un step
  const handleStepClick = (step) => {
    setSelectedStep(step);

    const stepRelations = stepsData.find(item => item.step === step).relations;
    if (stepRelations.length > 0) {
      setSelectedRelationId(stepRelations[0].id);
      setSelectedRelation(stepRelations[0]);

      // Check if the current product exists in the new relation
      const currentProductName = selectedProduct?.name;
      const firstRelationProducts = stepRelations[0].challenge_products;

      if (currentProductName && firstRelationProducts.some(product => product.name === currentProductName)) {
        // If the current product exists in the new relation, keep it selected
        const existingProduct = firstRelationProducts.find(product => product.name === currentProductName);
        setSelectedProduct(existingProduct);
      } else if (firstRelationProducts.length > 0) {
        // Otherwise, select the first product
        setSelectedProduct(firstRelationProducts[0]);
      }
    }
  };

  // Función para manejar el clic en una relación (subcategoría)
  const handleRelationClick = (relationId) => {
    setSelectedRelationId(relationId);
    const stepRelations = stepsData.find(item => item.step === selectedStep).relations;
    const relation = stepRelations.find(r => r.id === relationId);
    console.log('Relación seleccionada:', relation);
    setSelectedRelation(relation);

    // Check if the current product exists in the new relation
    const currentProductName = selectedProduct?.name;

    if (relation && relation.challenge_products.length > 0) {
      if (currentProductName && relation.challenge_products.some(product => product.name === currentProductName)) {
        // If the current product exists in the new relation, keep it selected
        const existingProduct = relation.challenge_products.find(product => product.name === currentProductName);
        setSelectedProduct(existingProduct);
      } else {
        // Otherwise, select the first product
        setSelectedProduct(relation.challenge_products[0]);
      }
    } else {
      setSelectedProduct(null);
    }
  };

  // Función para manejar el clic en un producto
  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedProduct && termsAccepted && cancellationAccepted) {
      console.log('Producto seleccionado:', selectedProduct);
      console.log('Variación seleccionada:', matchingVariation);
    }
  };

  // Función para aplicar el cupón
  const applyCoupon = () => {
    if (couponCode) {
      console.log('Cupón aplicado:', couponCode);
    }
  };

  // Use the matching variation's ID for checkout
  const handleContinue = () => {
    if (!session) {
      // Redireccionar al login con la URL actual como callback
      signIn(undefined, {
        callbackUrl: window.location.href
      });
      return; // Detener la ejecución aquí
    }

    if (selectedProduct && termsAccepted && cancellationAccepted) {
      const woocommerceId = matchingVariation?.id || selectedProduct.woocommerceId; // Asegura que haya un ID por defecto si no existe
      window.location.href = `https://neocapitalfunding.com/checkout/?add-to-cart=${woocommerceId}&quantity=1&document_id=${selectedRelation.documentId}&user_id=${user.documentId}`;
    }
  };

  // Función para extraer el valor numérico del balance del producto (10k, 20k, etc.)
  const extractBalance = (balanceStr) => {
    if (!balanceStr) return 0;
    const match = balanceStr.match(/(\d+)k/i);
    return match ? parseInt(match[1], 10) : 0;
  };

  // Función para contar etapas en la relación seleccionada
  const getRelationStages = () => {
    if (!selectedRelation) return 0;
    // Aquí deberíamos obtener el número de etapas de la relación seleccionada
    // Como no está claro en el código original cómo se cuentan las etapas,
    // voy a usar una propiedad ficticia 'stages' o devolver un valor predeterminado
    return selectedRelation.stages || relations.filter(r =>
      r.challenge_subcategory.name === selectedRelation.challenge_subcategory.name
    ).length;
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header>
        <section className="container mx-auto px-4 py-3 flex items-center">
          <Link href="/">
            <Image src="/images/logo-dark.png" alt="Neocapital logo" width={300} height={40} className="h-9 w-auto" />
          </Link>
        </section>
        <section className="bg-zinc-900 border-b border-zinc-800">
          <div className="container mx-auto px-4 py-4">
            <h2 className="text-lg font-bold text-amber-400">Compra tu producto</h2>
          </div>
        </section>
      </header>

      {/* Contenido principal */}
      <form onSubmit={handleSubmit} className=' w-[90%] mx-auto'>
        <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Configuración */}
          <div className="lg:col-span-2 space-y-6">
            {/* Steps Section */}
            <section className="bg-zinc-900 rounded-lg p-5 shadow-md border border-zinc-800">
              <div className="flex items-center mb-3">
                <h3 className="text-amber-400 font-medium">Steps</h3>
                <div className="relative ml-2 group">
                  <InformationCircleIcon className="h-5 w-5 text-zinc-500 hover:text-zinc-300" />
                  <div className="absolute z-10 invisible group-hover:visible bg-zinc-800 text-xs text-zinc-200 p-2 rounded-md w-48 top-full left-0 mt-1">
                    Selecciona el paso del proceso que deseas configurar
                  </div>
                </div>
              </div>
              <p className="text-zinc-400 mb-4 text-sm">Selecciona el tipo de paso que deseas configurar.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {stepsData.map((item, index) => (
                  <div key={index} className="relative">
                    <input
                      type="radio"
                      id={`step-${index}`}
                      name="step"
                      checked={selectedStep === item.step}
                      onChange={() => handleStepClick(item.step)}
                      className="sr-only"
                    />
                    <label
                      htmlFor={`step-${index}`}
                      className={classNames(
                        "block p-4 rounded-lg border cursor-pointer transition-all",
                        selectedStep === item.step
                          ? "bg-zinc-800 border-amber-500 text-white"
                          : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                      )}
                    >
                      <div className="product-info">
                        <span className="block font-medium">{item.step}</span>
                        <span className="block text-xs mt-1 text-zinc-500">
                          {item.relations.length} opciones
                        </span>
                      </div>
                      {selectedStep === item.step && (
                        <CheckIcon className="absolute top-4 right-4 h-5 w-5 text-amber-500" />
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </section>

            {/* Subcategorías Section */}
            {selectedStep && stepsData.length > 0 && (
              <section className="bg-zinc-900 rounded-lg p-5 shadow-md border border-zinc-800">
                <div className="flex items-center mb-3">
                  <h3 className="text-amber-400 font-medium">Subcategorías</h3>
                  <div className="relative ml-2 group">
                    <InformationCircleIcon className="h-5 w-5 text-zinc-500 hover:text-zinc-300" />
                    <div className="absolute z-10 invisible group-hover:visible bg-zinc-800 text-xs text-zinc-200 p-2 rounded-md w-48 top-full left-0 mt-1">
                      Elige la subcategoría para tu producto
                    </div>
                  </div>
                </div>
                <p className="text-zinc-400 mb-4 text-sm">
                  Selecciona la subcategoría para el paso {selectedStep}.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {stepsData
                    .find(item => item.step === selectedStep)
                    .relations.map((relation, index) => (
                      <div key={relation.id} className="relative">
                        <input
                          type="radio"
                          id={`subcategory-${relation.id}`}
                          name="subcategory"
                          checked={selectedRelationId === relation.id}
                          onChange={() => handleRelationClick(relation.id)}
                          className="sr-only"
                        />
                        <label
                          htmlFor={`subcategory-${relation.id}`}
                          className={classNames(
                            "block p-4 rounded-lg border cursor-pointer transition-all",
                            selectedRelationId === relation.id
                              ? "bg-zinc-800 border-amber-500 text-white"
                              : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                          )}
                        >
                          <span className="block font-medium">{relation.challenge_subcategory?.name}</span>
                          {selectedRelationId === relation.id && (
                            <CheckIcon className="absolute top-4 right-4 h-5 w-5 text-amber-500" />
                          )}
                        </label>
                      </div>
                    ))}
                </div>
              </section>
            )}

            {selectedRelationId && (
              <section className="bg-zinc-900 rounded-lg p-5 shadow-md border border-zinc-800">
                <div className="flex items-center mb-3">
                  <h3 className="text-amber-400 font-medium">Productos</h3>
                  <div className="relative ml-2 group">
                    <InformationCircleIcon className="h-5 w-5 text-zinc-500 hover:text-zinc-300" />
                    <div className="absolute z-10 invisible group-hover:visible bg-zinc-800 text-xs text-zinc-200 p-2 rounded-md w-48 top-full left-0 mt-1">
                      Selecciona el producto que deseas adquirir
                    </div>
                  </div>
                </div>
                <p className="text-zinc-400 mb-4 text-sm">
                  Elige el producto para{" "}
                  {stepsData
                    .find(item => item.step === selectedStep)
                    .relations.find(r => r.id === selectedRelationId)
                    ?.challenge_subcategory?.name}.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(() => {
                    const stepRelations = stepsData.find(item => item.step === selectedStep).relations;
                    const selectedRelation = stepRelations.find(r => r.id === selectedRelationId);
                    const relationProductNames = selectedRelation?.challenge_products.map(p => p.name) || [];

                    if (allproducts && allproducts.length > 0) {
                      // Sort products by balance value (10k, 20k, etc.)
                      const sortedProducts = [...allproducts].sort((a, b) => {
                        return extractBalance(a.balance) - extractBalance(b.balance);
                      });

                      return sortedProducts.map((product, productIndex) => {
                        const isInRelation = relationProductNames.includes(product.name);

                        return (
                          <div key={`allproduct-${productIndex}`} className="relative">
                            <input
                              type="radio"
                              id={`allproduct-${productIndex}`}
                              name="product"
                              checked={selectedProduct && selectedProduct.name === product.name}
                              onChange={() => handleProductClick(product)}
                              className="sr-only"
                              disabled={!isInRelation}
                            />
                            <label
                              htmlFor={`allproduct-${productIndex}`}
                              className={classNames(
                                "block p-4 rounded-lg border cursor-pointer transition-all",
                                selectedProduct && selectedProduct.name === product.name
                                  ? "bg-zinc-800 border-amber-500 text-white"
                                  : isInRelation
                                    ? "bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                                    : "bg-gray-900/20 border-gray-700 text-gray-500 opacity-50"
                              )}
                            >
                              <span className="block font-medium">{product.name}</span>
                              {product.balance && (
                                <span className="block text-xs mt-1 text-zinc-500">
                                  {product.balance}
                                </span>
                              )}
                              {product.isPremium && (
                                <span className="inline-block bg-amber-500 text-black text-xs px-2 py-1 rounded mt-2 font-semibold">
                                  Premium
                                </span>
                              )}
                              {selectedProduct && selectedProduct.name === product.name && (
                                <CheckIcon className="absolute top-4 right-4 h-5 w-5 text-amber-500" />
                              )}
                            </label>
                          </div>
                        );
                      });
                    } else {
                      return (
                        <p className="text-zinc-500 col-span-3">
                          No hay productos disponibles
                        </p>
                      );
                    }
                  })()}
                </div>
              </section>
            )}
          </div>

          {/* Columna derecha - Resumen del producto */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              <div className="bg-zinc-900 rounded-lg shadow-md border border-zinc-800 overflow-hidden">
                <header className="p-5 border-b border-zinc-800">
                  <h3 className="text-amber-400 font-medium text-xl flex gap-4 items-center"><span>Producto Seleccionado:</span>
                    {selectedProduct ? (
                      <>
                        <span className="text-xl font-bold text-white">{selectedProduct.name}</span>
                      </>
                    ) : (
                      <p className="text-zinc-500">Ningún producto seleccionado</p>
                    )}
                  </h3>
                </header>

                {/* Nueva sección informativa de etapas */}
                {selectedRelation && (
                  <div className="bg-zinc-800 p-4 border-b border-zinc-700">
                    <h4 className="text-amber-400 font-medium mb-2">Información Adicional</h4>
                    <div className="text-zinc-300">
                      <p className="flex justify-between mb-2">
                        <span>Subcategoría:</span>
                        <span className="font-medium">{selectedRelation.challenge_subcategory?.name}</span>
                      </p>
                      <p className="flex justify-between">
                        <span>N° Etapas:</span>
                        <span className="font-medium">{getRelationStages()}</span>
                      </p>
                    </div>
                  </div>
                )}

                {selectedProduct && (
                  <>
                    {selectedRelation && (
                      <div className="bg-zinc-900 p-5 shadow-md border-zinc-800">
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                          <div>
                            <section>
                              <h3 className="text-lg font-medium text-amber-400 mb-4">Características:</h3>
                              <ul className="space-y-3">
                                <li className="flex items-center text-zinc-300">
                                  <CheckIcon className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                                  <span>Leverage:</span>
                                  <strong className="ml-auto">{selectedRelation.leverage || "N/A"} %</strong>
                                </li>
                                <li className="flex items-center text-zinc-300">
                                  <CheckIcon className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                                  <span>Maximum Daily Loss:</span>
                                  <strong className="ml-auto">{selectedRelation.maximumDailyLoss || "N/A"} %</strong>
                                </li>
                                <li className="flex items-center text-zinc-300">
                                  <CheckIcon className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                                  <span>Maximum Loss:</span>
                                  <strong className="ml-auto">{selectedRelation.maximumLoss || "N/A"} %</strong>
                                </li>
                                <li className="flex items-center text-zinc-300">
                                  <CheckIcon className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                                  <span>Minimum Trading Days:</span>
                                  <strong className="ml-auto">{selectedRelation.minimumTradingDays || "N/A"} días</strong>
                                </li>
                                <li className="flex items-center text-zinc-300">
                                  <CheckIcon className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                                  <span>Profit Target:</span>
                                  <strong className="ml-auto">{selectedRelation.profitTarget || "N/A"} %</strong>
                                </li>
                                <li className="flex items-center text-zinc-300">
                                  <CheckIcon className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                                  <span>Maximum Total Loss:</span>
                                  <strong className="ml-auto">{selectedRelation.maximumTotalLoss || "N/A"} %</strong>
                                </li>
                                <li className="flex items-center text-zinc-300">
                                  <CheckIcon className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                                  <span>Maximum Loss Per Trade:</span>
                                  <strong className="ml-auto">{selectedRelation.maximumLossPerTrade || "N/A"} %</strong>
                                </li>
                              </ul>
                            </section>
                          </div>


                          <div className="space-y-6">

                            {/*
                            <section>
                              <span className="block text-amber-400 font-medium mb-3">Ingresa tu cupón</span>
                              <div className="flex">
                                <input
                                  type="text"
                                  placeholder="Escribe tu cupón aquí"
                                  className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-l-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                  value={couponCode}
                                  onChange={(e) => setCouponCode(e.target.value)}
                                />
                                <button
                                  type="button"
                                  disabled={!couponCode}
                                  onClick={applyCoupon}
                                  className={`uppercase px-4 py-2 rounded-r-md font-medium text-sm ${couponCode
                                    ? "bg-amber-500 text-black hover:bg-amber-600 transition-colors"
                                    : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                                  }`}
                                >
                                  Aplicar
                                </button>
                              </div>
                            </section>
                            */}

                            <div className="h-px bg-zinc-800"></div>

                            <section>
                              <h4 className="text-zinc-300 font-medium mb-4">Subtotal</h4>
                              <div className="flex justify-between mb-2 text-zinc-300">
                                <span>{selectedProduct.name}</span>
                                <span>${matchingVariation?.price || "N/A"}</span>
                              </div>
                              {/*
                              <div className="flex justify-between mb-2 text-zinc-400">
                                <div className="flex items-center">
                                  <span>Cupón</span>
                                  <TicketIcon className="h-4 w-4 ml-1" />
                                </div>
                                <span>-$0.00</span>
                              </div>
                              */}
                              <div className="h-px bg-zinc-800 my-4"></div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-zinc-300">Total</span>
                                <p className="text-2xl font-semibold text-amber-400">${matchingVariation?.price || "N/A"}</p>
                              </div>
                              <p className="text-xs text-zinc-500 text-right">*Precio no incluye tarifa de servicio de pago.</p>
                            </section>
                          </div>
                        </div>
                      </div>
                    )}

                    <section className="p-5 space-y-4">
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id="acceptTerms"
                          className="mt-1 h-4 w-4 border-zinc-700 rounded bg-zinc-800 text-amber-500 focus:ring-amber-500"
                          checked={termsAccepted}
                          onChange={() => setTermsAccepted(!termsAccepted)}
                        />
                        <label htmlFor="acceptTerms" className="ml-2 text-sm text-zinc-300">
                          Declaro que he leído y estoy de acuerdo con los{" "}
                          <span className="font-bold text-amber-400 cursor-pointer">Términos y Condiciones</span>,{" "}
                          <span className="font-bold text-amber-400 cursor-pointer">Política de Privacidad</span> y{" "}
                          <span className="font-bold text-amber-400 cursor-pointer">Política de Cookies</span>
                        </label>
                      </div>

                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id="acceptCancelation"
                          className="mt-1 h-4 w-4 border-zinc-700 rounded bg-zinc-800 text-amber-500 focus:ring-amber-500"
                          checked={cancellationAccepted}
                          onChange={() => setCancellationAccepted(!cancellationAccepted)}
                        />
                        <label htmlFor="acceptCancelation" className="ml-2 text-sm text-zinc-300">
                          Declaro que he leído y estoy de acuerdo con las Políticas de Cancelación y Reembolso.
                        </label>
                      </div>
                    </section>

                    <div className="p-5">
                      <button
                        onClick={handleContinue}
                        type="submit"
                        disabled={!selectedProduct || !termsAccepted || !cancellationAccepted}
                        className={`w-full flex items-center justify-center transition-colors py-3 px-4 rounded ${selectedProduct && termsAccepted && cancellationAccepted
                          ? "bg-amber-500 hover:bg-amber-600 text-black font-bold"
                          : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                          }`}
                      >
                        <span className="uppercase">Continuar</span>
                        <ChevronRightIcon className="h-5 w-5 ml-2" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChallengeRelations;