import { useSession } from "next-auth/react"; // Importamos el hook de sesión
import Layout from "../../components/layout/dashboard";
import Loader from "../../components/loaders/loader";
import { useStrapiData } from "../../services/strapiServiceJWT";
import { UserIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LogoGravatar from "../../components/LogoGravatar";
import MostrarDatosButton from "../profile/MostrarDatosButton"; // Importamos el botón aquí

const ProfilePage = () => {
  const { data: session } = useSession(); // Obtenemos la sesión
  const token = session?.jwt; // Extraemos el token JWT de la sesión

  // Usamos el hook que creamos para obtener los datos de 'users/me'
  const { data, error, isLoading } = useStrapiData("users/me", token);

  if (isLoading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  if (error) {
    return <Layout>Error al cargar los datos: {error.message}</Layout>;
  }

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
          {data.name || "Nombre no disponible"}
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
              <label className="text-base font-semibold dark:text-white text-black">
                Username
              </label>
            </div>
            <div className="w-full md:w-3/4">
              <p className="text-gray-700 dark:text-white">
                {data.username || "Username no disponible"}
              </p>
            </div>
          </div>

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
            <div className="w-full md:w-3/4">
              <p className="text-gray-700 dark:text-white">Si</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-lg font-semibold mb-4">Información Personal</p>
      </div>

      <div className="p-6 dark:bg-black bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
        {/* Nombre y Apellido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="firstName">Nombre</Label>
            <Input
              type="text"
              id="firstName"
              placeholder={data.firstName || "Nombre no disponible"}
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="lastName">Apellido</Label>
            <Input
              type="text"
              id="lastName"
              placeholder={data.lastName || "Apellido no disponible"}
            />
          </div>
        </div>

        {/* Teléfono */}
        <div className="mt-4 grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            type="tel"
            id="phone"
            placeholder={data.phone || "Teléfono no disponible"}
          />
        </div>

        {/* País y Ciudad */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="country">País</Label>
            <Input
              type="text"
              id="country"
              placeholder={data.country || "País no disponible"}
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="city">Ciudad</Label>
            <Input
              type="text"
              id="city"
              placeholder={data.city || "Ciudad no disponible"}
            />
          </div>
        </div>

        {/* Calle y Código Postal */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="street">Calle</Label>
            <Input
              type="text"
              id="street"
              placeholder={data.street || "Calle no disponible"}
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="postalCode">Código Postal</Label>
            <Input
              type="text"
              id="postalCode"
              placeholder={data.postalCode || "Código postal no disponible"}
            />
          </div>
        </div>
      </div>

      {/* Botón para mostrar los datos en consola */}
      <MostrarDatosButton data={data} />
    </Layout>
  );
};

export default ProfilePage;
