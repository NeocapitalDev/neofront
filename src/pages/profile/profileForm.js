import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CountryDropdown } from "@/components/ui/country-dropdown";

const ProfileForm = ({ formData, setFormData, token }) => {
    const [error, setError] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "phone" && !/^\d*$/.test(value)) {
            setError((prev) => ({
                ...prev,
                [name]: "El teléfono solo debe contener números.",
            }));
            setTimeout(() => setError((prev) => ({ ...prev, [name]: "" })), 2000);
            return;
        }

        if (value.length > 50 && ["firstName", "lastName", "city", "street"].includes(name)) {
            setError((prev) => ({
                ...prev,
                [name]: "El campo no debe exceder los 50 caracteres.",
            }));
            setTimeout(() => setError((prev) => ({ ...prev, [name]: "" })), 2000);
            return;
        }

        if (name === "zipCode" && value.length > 10) {
            setError((prev) => ({
                ...prev,
                [name]: "El código postal no debe exceder los 10 caracteres.",
            }));
            setTimeout(() => setError((prev) => ({ ...prev, [name]: "" })), 2000);
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCountryChange = (value) => {
        setFormData((prev) => ({ ...prev, country: value.alpha3 }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { firstName, lastName, phone, country, city, street, zipCode } = formData;

        // Validar los campos antes de enviar
        if (!firstName || !lastName || !phone || !country || !city || !street || !zipCode) {
            setError({ form: "Todos los campos son obligatorios." });
            setTimeout(() => setError({}), 3000);
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    phone,
                    country,
                    city,
                    street,
                    zipCode,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Error al actualizar los datos en Strapi');
            }

            const data = await response.json();
            console.log("Datos actualizados:", data);
            alert("Datos actualizados con éxito.");
        } catch (error) {
            console.error("Error al actualizar los datos:", error);
            alert("Hubo un error al actualizar los datos. Por favor, inténtalo nuevamente.");
        }
    };


    return (
        <form
            onSubmit={handleSubmit}
            className="mt-5 space-y-6 p-6 dark:bg-black bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black"
        >
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
                    />
                    {error.firstName && <p className="text-red-500">{error.firstName}</p>}
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
                    />
                    {error.lastName && <p className="text-red-500">{error.lastName}</p>}
                </div>
            </div>

            <div className="grid w-full items-start gap-1.5">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Ingrese su teléfono"
                />
                {error.phone && <p className="text-red-500">{error.phone}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid w-full items-start gap-1.5">
                    <Label htmlFor="country">País</Label>
                    <CountryDropdown
                        placeholder="Seleccione un país"
                        defaultValue={formData.country}
                        onChange={handleCountryChange}
                    />
                    {error.country && <p className="text-red-500">{error.country}</p>}
                </div>

                <div className="grid w-full items-start gap-1.5">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Ingrese su ciudad"
                    />
                    {error.city && <p className="text-red-500">{error.city}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid w-full items-start gap-1.5">
                    <Label htmlFor="street">Calle</Label>
                    <Input
                        type="text"
                        id="street"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        placeholder="Ingrese su calle"
                    />
                    {error.street && <p className="text-red-500">{error.street}</p>}
                </div>

                <div className="grid w-full items-start gap-1.5">
                    <Label htmlFor="zipCode">Código Postal</Label>
                    <Input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        placeholder="Ingrese su código postal"
                    />
                    {error.zipCode && <p className="text-red-500">{error.zipCode}</p>}
                </div>
            </div>

            {error.form && <p className="text-red-500">{error.form}</p>}

            <button
                type="submit"
                className={`px-4 py-2 font-semibold rounded ${isSubmitting ? "bg-gray-400" : "bg-amber-500 hover:bg-amber-600"
                    }`}
                disabled={isSubmitting}
            >
                {isSubmitting ? "Enviando..." : "Enviar"}
            </button>
        </form>
    );
};

export default ProfileForm;
