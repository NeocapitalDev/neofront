// pages/index.js
import { useState, useEffect } from 'react'
import Modal from 'react-modal'

// Configuración de react-modal para accesibilidad
if (typeof window !== 'undefined') {
  Modal.setAppElement('body')
}

export default function Home() {
  const [data, setData] = useState([])
  const [selectedChallenge, setSelectedChallenge] = useState(null)
  const [modalIsOpen, setModalIsOpen] = useState(false)

  // Obtenemos los datos de la API al montar el componente
  useEffect(() => {
    fetch('http://localhost:1337/api/challenge-relations-stages?populate=*')
      .then((res) => res.json())
      .then((json) => {
        setData(json.data)
        console.log('Datos obtenidos:', json.data)
      })
      .catch((err) => console.error('Error al obtener los datos:', err))
  }, [])

  // Filtrar las subcategorías únicas
  // Se agrupan por el id de challenge_subcategory; si no existe se asigna "null"
  const uniqueSubcategories = []
  data.forEach((item) => {
    const subcat = item.challenge_subcategory || null
    const exists = uniqueSubcategories.find(
      (i) =>
        (i.challenge_subcategory && subcat && i.challenge_subcategory.id === subcat.id) ||
        (i.challenge_subcategory === null && subcat === null)
    )
    if (!exists) {
      uniqueSubcategories.push(item)
    }
  })

  const openModal = (challenge) => {
    setSelectedChallenge(challenge)
    setModalIsOpen(true)
  }

  const closeModal = () => {
    setSelectedChallenge(null)
    setModalIsOpen(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSelectedChallenge((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = () => {
    console.log('Guardando datos:', selectedChallenge)
    // Aquí podrías implementar el PUT/POST a la API
    closeModal()
  }

  return (
    <div className="p-8 bg-gray-100 dark:bg-gray-900 dark:text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Lista de Challenge Subcategories</h1>
      <ul className="space-y-2">
        {uniqueSubcategories.map((item) => (
          <li
            key={item.id}
            onClick={() => openModal(item)}
            className="cursor-pointer bg-gray-200 dark:bg-gray-800 p-4 rounded hover:bg-gray-300 dark:hover:bg-gray-700"
          >
            {item.challenge_subcategory && item.challenge_subcategory.name
              ? item.challenge_subcategory.name
              : 'Sin nombre'}
          </li>
        ))}
      </ul>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Editar Challenge"
        className="fixed inset-0 flex items-center justify-center outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        {selectedChallenge && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Editar:{' '}
              {selectedChallenge.challenge_subcategory && selectedChallenge.challenge_subcategory.name
                ? selectedChallenge.challenge_subcategory.name
                : 'Sin nombre'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block font-medium text-gray-900 dark:text-gray-200">
                  Minimum Trading Days:
                </label>
                <input
                  type="number"
                  name="minimumTradingDays"
                  value={selectedChallenge.minimumTradingDays || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-900 dark:text-gray-200">
                  Maximum Daily Loss:
                </label>
                <input
                  type="number"
                  name="maximumDailyLoss"
                  value={selectedChallenge.maximumDailyLoss}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-900 dark:text-gray-200">
                  Maximum Loss:
                </label>
                <input
                  type="number"
                  name="maximumLoss"
                  value={selectedChallenge.maximumLoss}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-900 dark:text-gray-200">
                  Profit Target:
                </label>
                <input
                  type="number"
                  name="profitTarget"
                  value={selectedChallenge.profitTarget || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-900 dark:text-gray-200">
                  Leverage:
                </label>
                <input
                  type="number"
                  name="leverage"
                  value={selectedChallenge.leverage}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Guardar
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
