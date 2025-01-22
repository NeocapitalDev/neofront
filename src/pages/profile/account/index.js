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
    <div className="min-h-60 rounded-xl dark:text-white dark:bg-zinc-800 dark:shadow-black bg-white text-black flex flex-col items-center p-6">
      <h2 className="text-xl font-semibold">Información de Cuenta</h2>
      <p className="mt-2 text-gray-400">
        Aquí puedes ver y editar los detalles de tu cuenta.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 mt-6 rounded shadow-md w-full max-w-md"
      >
        <div className="mb-4">
          <label htmlFor="nombreUsuario" className="block mb-2 text-sm font-bold">
            Nombre de usuario
          </label>
          <input
            type="email"
            id="nombreUsuario"
            name="nombreUsuario"
            value={formData.nombreUsuario}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
            disabled
          />
        </div>
        <div className="mb-4">
          <label htmlFor="idioma" className="block mb-2 text-sm font-bold">
            Idioma
          </label>
          <select
            id="idioma"
            name="idioma"
            value={formData.idioma}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
          >
            <option value="Español">Español</option>
            <option value="Inglés">Inglés</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="zonaHoraria" className="block mb-2 text-sm font-bold">
            Zona horaria
          </label>
          <select
            id="zonaHoraria"
            name="zonaHoraria"
            value={formData.zonaHoraria}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
          >
            <option value="Autodetectada">Autodetectada</option>
            <option value="GMT-5">GMT-5</option>
            <option value="GMT+1">GMT+1</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full p-2 mt-4 bg-blue-600 rounded text-white font-bold hover:bg-blue-700"
        >
          Guardar
        </button>
      </form>
    </div>
  );
}

export default Account;
