import { useState } from "react";

function Account() {
  const [formData, setFormData] = useState({
    nombreUsuario: "neocapital2025@gmail.com",
    idioma: "Español",
    zonaHoraria: "Autodetectada",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos guardados:", formData);
    // Aquí puedes manejar el envío de datos a una API o un servidor
  };

  return (
    <div className="flex flex-col items-center p-6  bg-white text-black dark:text-white dark:bg-zinc-800 dark:shadow-black w-full max-w-7xl mx-auto ">
      <form
        onSubmit={handleSubmit}
        className="w-full space-y-4"
      >
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="flex-1">
            <label
              htmlFor="nombreUsuario"
              className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              Nombre de usuario
            </label>
            <input
              type="email"
              id="nombreUsuario"
              name="nombreUsuario"
              value={formData.nombreUsuario}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-100 border border-gray-300 text-gray-900 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
              disabled
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="idioma"
              className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              Idioma
            </label>
            <select
              id="idioma"
              name="idioma"
              value={formData.idioma}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-100 border border-gray-300 text-gray-900 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
            >
              <option value="Español">Español</option>
              <option value="Inglés">Inglés</option>
            </select>
          </div>
        </div>
        <div>
          <label
            htmlFor="zonaHoraria"
            className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Zona horaria
          </label>
          <select
            id="zonaHoraria"
            name="zonaHoraria"
            value={formData.zonaHoraria}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-100 border border-gray-300 text-gray-900 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
          >
            <option value="Autodetectada">Autodetectada</option>
            <option value="GMT-5">GMT-5</option>
            <option value="GMT+1">GMT+1</option>
          </select>
        </div>
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="w-40 p-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}

export default Account;
