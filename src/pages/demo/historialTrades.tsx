import { useState, useEffect } from 'react';
import MetaApi, { StreamingMetaApiConnectionInstance } from 'metaapi.cloud-sdk';

interface IHistoricalOrdersProps {
  accountId: string;
}

const HistoricalOrders: React.FC<IHistoricalOrdersProps> = ({ accountId }) => {
  const [historicalOrders, setHistoricalOrders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const token = process.env.NEXT_PUBLIC_TOKEN_META_API || '';
  const domain = 'agiliumtrade.agiliumtrade.ai';

  const connectToMetaApi = async (): Promise<StreamingMetaApiConnectionInstance> => {
    const metaApi = new MetaApi(token, { domain });
    const account = await metaApi.metatraderAccountApi.getAccount(accountId);

    await account.waitConnected();
    const connection = account.getStreamingConnection();

    await connection.connect();
    await connection.waitSynchronized();

    return connection;
  };

  const fetchHistoricalOrders = async () => {
    try {
      const connection = await connectToMetaApi();
      const historyStorage = connection.historyStorage;

      setHistoricalOrders(historyStorage.historyOrders.slice(-5));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    if (accountId) {
      fetchHistoricalOrders();
    }
  }, [accountId]);

  return (
    <div>
      <h2>Historical Orders</h2>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <ul>
        {historicalOrders.length > 0 ? (
          historicalOrders.map((order, index) => (
            <li key={index}>{JSON.stringify(order)}</li>
          ))
        ) : (
          <p>No historical orders found.</p>
        )}
      </ul>
    </div>
  );
};

export default HistoricalOrders;
