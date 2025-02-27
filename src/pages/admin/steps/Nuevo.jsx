import React, { useEffect } from "react";

export const FetchChallengeSteps = () => {
  useEffect(() => {
    // Realiza el fetch a la API definida
    fetch("http://localhost:1337/api/challenge-steps/get-all-data", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Datos recibidos:", data);
      })
      .catch((error) => {
        console.error("Error al obtener datos:", error);
      });
  }, []);

  return (
    <div>
      <h2>Fetch de Challenge Steps</h2>
      <p>Revisa la consola del navegador para ver los datos obtenidos.</p>
    </div>
  );
};
