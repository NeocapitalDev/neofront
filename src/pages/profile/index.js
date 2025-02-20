import { useSession } from 'next-auth/react';
import Layout from '../../components/layout/dashboard';
import Loader from '../../components/loaders/loader';
import { useStrapiData } from '../../services/strapiServiceJWT';
import { UserIcon } from '@heroicons/react/24/outline';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LogoGravatar from "../../components/LogoGravatar";
import React, { useState, useEffect } from "react";
import { CountryDropdown } from '@/components/ui/country-dropdown';
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { toast } from 'sonner';

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    country: "",
    city: "",
    street: "",
    zipCode: "",
  });

  const [error, setError] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    country: "",
    city: "",
    street: "",
    zipCode: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const { data: session } = useSession();
  const token = session?.jwt;

  const { data, error: fetchError, isLoading } = useStrapiData('users/me?populate=challenges', token);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone" && !/^\d*$/.test(value)) {
      setError((prev) => ({ ...prev, [name]: "El teléfono solo debe contener números." }));
      setTimeout(() => setError((prev) => ({ ...prev, [name]: "" })), 2000);
      return;
    }

    if (value.length > 50 && (name === "firstName" || name === "lastName" || name === "city" || name === "street")) {
      setError((prev) => ({ ...prev, [name]: "El campo no debe exceder los 50 caracteres." }));
      setTimeout(() => setError((prev) => ({ ...prev, [name]: "" })), 2000);
      return;
    }

    if (value.length > 10 && name === "zipCode") {
      setError((prev) => ({ ...prev, [name]: "El código postal no debe exceder 10 caracteres." }));
      setTimeout(() => setError((prev) => ({ ...prev, [name]: "" })), 2000);
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCountryChange = (value) => {
    setFormData((prev) => ({ ...prev, country: value.alpha3 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Deshabilita el botón mientras se procesa la solicitud

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error en la respuesta de Strapi:", errorData);
        toast.error('Error en la respuesta');
        throw new Error(`Error ${response.status} - ${errorData?.error?.message || "Error desconocido"}`);
      }

      setSuccess("Datos actualizados correctamente.");
      toast.success('Datos actualizados correctamente.');
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      setErrors({ form: error.message });
      setTimeout(() => setErrors({ form: "" }), 3000);
    } finally {
      setLoading(false); // Habilita el botón nuevamente después de completar la solicitud
    }
  };

  useEffect(() => {
    if (data) {
      setFormData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        phone: data.phone || "",
        country: data.country || "",
        city: data.city || "",
        street: data.street || "",
        zipCode: data.zipCode || "",
      });
    }
  }, [data]);


  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const timer = setTimeout(() => {
        setErrors({});
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  if (isLoading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  if (fetchError) {
    return <Layout>Error al cargar los datos: {fetchError.message}</Layout>;
  }

  // Convertir isVerified a booleano para evitar errores
  const isVerified = !!data?.isVerified;

  // Asegurar que challenges sea un array antes de aplicar .some()
  const hasPhase3Challenge = Array.isArray(data?.challenges) &&
    data.challenges.some(challenge => challenge.phase === 3);


  // Debugging: Verificar valores en consola
  //console.log("isVerified:", isVerified);
  //console.log("hasPhase3Challenge:", hasPhase3Challenge);
  //console.log("data?.challenges:", data?.challenges);

  //console.log("Challenges details:", data.challenges.map(challenge => ({
  //  id: challenge.id,
  //  documentId: challenge.documentId,
  // phase: challenge.phase, // Verificar si existe la propiedad phase
  //  fullChallenge: challenge // Inspeccionar el objeto completo
  //})));

  return (
    <Layout>
      <div className="p-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <UserIcon className="w-6 h-6 text-gray-600 dark:text-gray-200" />
            <h1 className="text-xl font-semibold">Perfil</h1>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-lg font-semibold mb-4">Información de Cuenta</p>
      </div>

      <div className="flex flex-col items-center p-6 dark:bg-black bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
        <LogoGravatar
          email={session.user.email || "usuario@example.com"}
          className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4"
        />
        <h1 className="text-3xl font-bold dark:text-white text-slate-700 mb-2">
          {session.firstName || "Username no disponible"}
        </h1>
        <p className="dark:text-white text-gray-400 text-sm mb-8">
          Fecha de creación:{" "}
          {data.createdAt
            ? new Date(data.createdAt).toLocaleDateString()
            : "No disponible"}
        </p>

        <div className="w-full space-y-6 bg-gray-100 p-6 rounded-lg dark:bg-zinc-800">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              <label className="text-base font-semibold text-black dark:text-white">
                Email
              </label>
            </div>
            <div className="w-full md:w-3/4">
              <p className="text-gray-700 dark:text-white">
                {data.email || "Correo no disponible"}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              <label className="text-base font-semibold text-black dark:text-white">
                Cuenta verificada
              </label>
            </div>

            <div className="w-full md:w-3/4 flex items-center space-x-2">
              {isVerified ? (
                <CheckCircleIcon className="w-6 h-6 text-green-500" />
              ) : (
                <XCircleIcon className="w-6 h-6 text-red-500" />
              )}
              <p className="text-gray-700 dark:text-white">
                {isVerified ? "Verificado" : "No verificado"}
              </p>
            </div>
          </div>
        </div>
      </div>


      {/*Formulario del perfil */}
      <form onSubmit={handleSubmit} className="mt-5 space-y-6 p-6 dark:bg-black bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
        <div className="mt-6">
          <p className="text-lg font-semibold mb-4">Información Personal</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid w-full items-start gap-1.5">
            <Label htmlFor="firstName">Nombre</Label>
            <Input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Ingrese su nombre"
              disabled={isVerified}
            />
            <div className="h-1">
              {error.firstName && <div className="text-red-500">{error.firstName}</div>}
              {!formData.firstName && error.form && (
                <div className="text-red-500">Campo obligatorio</div>
              )}
            </div>
          </div>

          <div className="grid w-full items-start gap-1.5">
            <Label htmlFor="lastName">Apellido</Label>
            <Input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Ingrese su apellido"
              disabled={isVerified}
            />
            <div className="h-1">
              {error.lastName && <div className="text-red-500">{error.lastName}</div>}
              {!formData.lastName && error.form && (
                <div className="text-red-500">Campo obligatorio</div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 grid w-full items-center gap-1.5">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Ingrese su teléfono"
            disabled={isVerified}
          />
          <div className="h-1">
            {error.phone && <div className="text-red-500">{error.phone}</div>}
            {!formData.phone && error.form && (
              <div className="text-red-500">Campo obligatorio</div>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="country">País</Label>
            <CountryDropdown
              placeholder="Elige un país"
              defaultValue={formData.country}
              onChange={handleCountryChange}
              disabled={isVerified}
            />
            <div className="h-1">
              {error.country && <div className="text-red-500">{error.country}</div>}
              {!formData.country && error.form && (
                <div className="text-red-500">Campo obligatorio</div>
              )}
            </div>
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="city">Ciudad</Label>
            <Input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Ingrese su ciudad"
              disabled={isVerified}
            />
            <div className="h-1">
              {error.city && <div className="text-red-500">{error.city}</div>}
              {!formData.city && error.form && (
                <div className="text-red-500">Campo obligatorio</div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="street">Calle</Label>
            <Input
              type="text"
              id="street"
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="Ingrese su calle"
              disabled={isVerified}
            />
            <div className="h-1">
              {error.street && <div className="text-red-500">{error.street}</div>}
              {!formData.street && error.form && (
                <div className="text-red-500">Campo obligatorio</div>
              )}
            </div>
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="zipCode">Código Postal</Label>
            <Input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              placeholder="Ingrese su código postal"
              disabled={isVerified}
            />
            <div className="h-1">
              {error.zipCode && <div className="text-red-500">{error.zipCode}</div>}
              {!formData.zipCode && error.form && (
                <div className="text-red-500">Campo obligatorio</div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
          <button
            type="submit"
            className="px-4 py-2 bg-[var(--app-primary)] text-black font-semibold rounded hover:bg-[var(--app-secondary)]"
            disabled={loading || isVerified}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>

    </Layout>
  );
};

export default ProfilePage;
