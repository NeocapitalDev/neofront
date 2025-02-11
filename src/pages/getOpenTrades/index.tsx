import { useState, useEffect } from 'react';
import MetaApi, { MetaStats } from 'metaapi.cloud-sdk';

export default function GetTradesPage() {
  const [accountId, setAccountId] = useState('');
  const [token, setToken] = useState('');
  const [domain, setDomain] = useState('agiliumtrade.agiliumtrade.ai');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState([]);
  const [errors, setErrors] = useState([]);

  const log = (message) => setLogs((prev) => [...prev, message]);
  const logErr = (error) => setErrors((prev) => [...prev, error.message || error]);

  const reset = () => {
    setIsConnecting(false);
    setIsConnected(false);
    setLogs([]);
    setErrors([]);
    setAccountId('');
    setToken('');
  };

  const fetchData = async (event) => {
    event.preventDefault();
    if (!accountId || !token || isConnected) return;
    setIsConnecting(true);
    try {
      const metaApi = new MetaApi(token, { domain });
      const account = await metaApi.metatraderAccountApi.getAccount(accountId);

      log('Deploying account');
      if (account.state !== 'DEPLOYED') await account.deploy();
      if (account.connectionStatus !== 'CONNECTED') await account.waitConnected();

      const metaStats = new MetaStats(token, { domain });
      log('Fetching account trades');
      const trades = await metaStats.getAccountTrades(accountId, '2020-01-01 00:00:00.000', '2021-01-01 00:00:00.000');
      log(trades.slice(-5));
      setIsConnected(true);
    } catch (error) {
      logErr(error);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors">
      <div className="p-6 max-w-lg w-full bg-white rounded-xl shadow-md space-y-4 dark:bg-white text-black">
        <h1 className="text-xl font-bold text-center">MetaStats - Get Open Trades</h1>
        <form onSubmit={fetchData} className="space-y-3">
          <input
            type="text"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            placeholder="Account ID"
            className="w-full p-2 border rounded bg-white text-black"
            disabled={isConnecting || isConnected}
            required
          />
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Token"
            className="w-full p-2 border rounded bg-white text-black"
            disabled={isConnecting || isConnected}
            required
          />
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Domain"
            className="w-full p-2 border rounded bg-white text-black"
            disabled={isConnecting || isConnected}
            required
          />
          <div className="flex justify-between">
            <button
              type="submit"
              disabled={isConnecting || isConnected}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
            <button type="button" onClick={reset} className="px-4 py-2 bg-gray-500 text-white rounded">
              Reset
            </button>
          </div>
        </form>
        {logs.length > 0 && (
          <div className="mt-4 p-2 bg-green-100 rounded">
            <h2 className="font-bold">Logs</h2>
            <pre className="text-sm">{JSON.stringify(logs, null, 2)}</pre>
          </div>
        )}
        {errors.length > 0 && (
          <div className="mt-4 p-2 bg-red-100 rounded">
            <h2 className="font-bold">Errors</h2>
            <pre className="text-sm text-red-600">{JSON.stringify(errors, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
