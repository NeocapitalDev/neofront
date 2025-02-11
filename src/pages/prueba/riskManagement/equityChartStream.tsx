/* eslint-disable max-len */
/* eslint-disable complexity */
import { useEffect, useState } from 'react';
import MetaApi, { EquityChartListener, RiskManagement } from 'metaapi.cloud-sdk';

interface IRiskManagementEquityChartStreamProps {
  accountId?: string;
  token?: string;
  domain?: string;
}

export function RiskManagementEquityChartStream({
  accountId: defaultAccountId = '',
  token: defaultToken = '',
  domain: defaultDomain = ''
}: IRiskManagementEquityChartStreamProps) {
  const [areResourcesNarrowedDown, setAreResourcesNarrowedDown] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [resultLog, setResultLog] = useState<unknown[]>([]);
  const [errorLog, setErrorLog] = useState<unknown[]>([]);
  const [accountId, setAccountId] = useState(defaultAccountId);
  const [domain, setDomain] = useState(defaultDomain);
  const [token, setToken] = useState(defaultToken);

  const logErr = (...args: unknown[]) => setErrorLog(logs => [...logs, ...args.map(arg => (arg as any).message || arg)]);
  const log = (...args: unknown[]) => setResultLog(logs => [...logs, ...args]);

  class EquityChartListenerLogged extends EquityChartListener {
    async onEquityRecordUpdated(equityChartEvent: unknown) {
      log('Equity record updated event received', equityChartEvent);
    }
    async onEquityRecordCompleted() {
      log('Equity record completed event received');
    }
    async onConnected() {
      log('On connected event received');
    }
    async onDisconnected() {
      log('On disconnected event received');
    }
    async onError(error: unknown) {
      logErr('Error event received', error);
    }
  }

  const fetchData = async () => {
    try {
      const metaApi = new MetaApi(token, { domain });
      setAreResourcesNarrowedDown(metaApi.tokenManagementApi.areTokenResourcesNarrowedDown(token));
      const riskManagement = new RiskManagement(token, { domain });
      const riskManagementApi = riskManagement.riskManagementApi;
      const equityChartListener = new EquityChartListenerLogged(accountId);
      const listenerId = await riskManagementApi.addEquityChartListener(equityChartListener, accountId);
      log('Streaming equity chart events for 1 minute...');
      await new Promise(res => setTimeout(res, 60000));
      riskManagementApi.removeEquityChartListener(listenerId);
      const equityChart = await riskManagementApi.getEquityChart(accountId);
      log('Equity chart', equityChart);
    } catch (err) {
      logErr(err);
    }
  };

  const reset = () => {
    setIsConnecting(false);
    setIsConnected(false);
    setResultLog([]);
    setErrorLog([]);
    setAccountId(defaultAccountId);
    setToken(defaultToken);
    setDomain(defaultDomain);
  };

  const triggerToFetchData = (event: React.FormEvent) => {
    event.preventDefault();
    if (isConnected || !accountId || !token) return;
    setIsConnecting(true);
  };

  useEffect(() => {
    if (!isConnecting || isConnected) return;
    fetchData()
      .then(() => setIsConnected(true))
      .catch(err => logErr('Failed to connect', err))
      .finally(() => setIsConnecting(false));
  }, [isConnecting, isConnected]);

  return (
    <div className="max-w-lg mx-auto p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Risk Management: Equity Chart Stream</h1>
      <form onSubmit={triggerToFetchData} onReset={reset} className="mt-4 space-y-4">
        <label className="block text-gray-700 dark:text-gray-300">Account ID</label>
        <input className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" value={accountId} onChange={e => setAccountId(e.target.value)} />
        <label className="block text-gray-700 dark:text-gray-300">Token</label>
        <input className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" value={token} onChange={e => setToken(e.target.value)} />
        <label className="block text-gray-700 dark:text-gray-300">Domain</label>
        <input className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" value={domain} onChange={e => setDomain(e.target.value)} />
        <button type="submit" disabled={isConnecting || isConnected} className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400">Connect</button>
        <button type="reset" className="w-full py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Reset</button>
      </form>
      {!areResourcesNarrowedDown && (
        <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-200 rounded">
          <h2 className="font-bold">Warning</h2>
          <p>It seems like you are using an admin API token.</p>
          <p>Since the token can be retrieved from the browser or mobile apps by the end user, this can lead to your application being compromised unless you understand what you are doing.</p>
          <p>
            Please use <a href="https://github.com/metaapi/metaapi-javascript-sdk/blob/master/docs/tokenManagementApi.md" target="_blank" className="text-blue-600 dark:text-blue-300">Token Management API</a> in your backend application to produce secure tokens which you can then use in web UI or mobile apps.
          </p>
        </div>
      )}
      {resultLog.length > 0 && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
          <h2 className="font-bold">Logs</h2>
          <pre className="text-sm text-gray-900 dark:text-gray-100">{JSON.stringify(resultLog, null, 2)}</pre>
        </div>
      )}
      {errorLog.length > 0 && (
        <div className="mt-4 p-4 bg-red-100 dark:bg-red-700 text-red-900 dark:text-red-100 rounded">
          <h2 className="font-bold">Errors</h2>
          <pre className="text-sm">{JSON.stringify(errorLog, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
