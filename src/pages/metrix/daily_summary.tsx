"use client";

import { useState, useEffect } from 'react';
import MetaApi, { StreamingMetaApiConnectionInstance } from 'metaapi.cloud-sdk';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";

interface HistoricalOrdersProps {
  accountId: string;
}

const HistoricalOrders: React.FC<HistoricalOrdersProps> = ({ accountId }) => {
  const [historicalOrders, setHistoricalOrders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const token = process.env.NEXT_PUBLIC_TOKEN_META_API || '';
  const domain = 'agiliumtrade.agiliumtrade.ai';

  const connectToMetaApi = async (): Promise<StreamingMetaApiConnectionInstance | null> => {
    try {
      const metaApi = new MetaApi(token, { domain });
      const account = await metaApi.metatraderAccountApi.getAccount(accountId);

      await account.waitConnected();
      const connection = account.getStreamingConnection();
      await connection.connect();
      await connection.waitSynchronized();

      return connection;
    } catch (err) {
      console.error("Error conectando a MetaApi:", err);
      setError("No se pudo conectar a MetaApi.");
      return null;
    }
  };

  const fetchHistoricalOrders = async () => {
    setLoading(true);
    try {
      const connection = await connectToMetaApi();
      if (!connection) return;

      const historyStorage = connection.historyStorage;
      const orders = historyStorage.historyOrders.slice(-5);
      // console.log("Órdenes obtenidas:", orders);
      setHistoricalOrders(orders);
    } catch (err) {
      console.error("Error obteniendo órdenes:", err);
      setError("Error obteniendo datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accountId) {
      fetchHistoricalOrders();
    }
  }, [accountId]);

  const formatDate = (dateString: string | number | undefined): string => {
    if (!dateString || dateString === "-") return "-";
    let date = new Date(dateString);
    return isNaN(date.getTime()) ? "-" : date.toLocaleString("es-ES", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <div className="dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black p-4 overflow-x-auto">
      {loading ? (
        <p className="text-center text-gray-500">Cargando órdenes...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Símbolo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Volumen</TableHead>
              <TableHead>Precio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historicalOrders.length > 0 ? (
              historicalOrders.map((order, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{formatDate(order.doneTime)}</TableCell>
                  <TableCell>{order.symbol}</TableCell>
                  <TableCell>{order.type}</TableCell>
                  <TableCell>{order.volume}</TableCell>
                  <TableCell>${order.openPrice ? order.openPrice.toFixed(2) : "-"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No hay datos para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default HistoricalOrders;
