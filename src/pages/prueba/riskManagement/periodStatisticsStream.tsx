/* eslint-disable max-len */
/* eslint-disable complexity */
import { useEffect, useState } from 'react';
import MetaApi, { PeriodStatisticsListener, RiskManagement } from 'metaapi.cloud-sdk';

interface IRiskManagementPeriodStatisticsProps {
  accountId?: string;
  token?: string;
  domain?: string;
}

export function RiskManagementPeriodStatistics({
  accountId: defaultAccountId = '',
  token: defaultToken = '',
  domain: defaultDomain = 'agiliumtrade.agiliumtrade.ai'
}: IRiskManagementPeriodStatisticsProps) {
  const [areResourcesNarrowedDown, setAreResourcesNarrowedDown] = useState<boolean>(true);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [resultLog, setResultLog] = useState<unknown[]>([]);
  const [errorLog, setErrorLog] = useState<unknown[]>([]);
  const [accountId, setAccountId] = useState<string>(defaultAccountId);
  const [token, setToken] = useState<string>(defaultToken);
  const [domain, setDomain] = useState<string>(defaultDomain);

  const logErr = (...args: unknown[]) => setErrorLog(logs => [...logs, ...args.map(arg => (arg as any).message || arg)]);
  const log = (...args: unknown[]) => setResultLog(logs => [...logs, ...args]);

  class PeriodStatisticsListenerLogged extends PeriodStatisticsListener {
    async onPeriodStatisticsCompleted() {
      log('Period statistics completed event received');
    }
    async onTrackerCompleted() {
      log('Tracker completed event received');
    }
    async onConnected() {
      log('Connected to period statistics stream');
    }
    async onDisconnected() {
      log('Disconnected from period statistics stream');
    }
    async onError(error: unknown) {
      logErr(error);
    }
  }

  const fetchData = async () => {
    try {
      const metaApi = new MetaApi(token, { domain });
      setAreResourcesNarrowedDown(metaApi.tokenManagementApi.areTokenResourcesNarrowedDown(token));
      const riskManagement = new RiskManagement(token, { domain });
      const riskManagementApi = riskManagement.riskManagementApi;

      const trackerId = await riskManagementApi.createTracker(accountId, {
        name: 'example-tracker',
        absoluteDrawdownThreshold: 5,
        period: 'day'
      });
      log('Created tracker', trackerId.id);

      const periodStatisticsListener = new PeriodStatisticsListenerLogged(accountId, trackerId.id);
      const listenerId = await riskManagementApi.addPeriodStatisticsListener(
        periodStatisticsListener, accountId, trackerId.id
      );

      log('Streaming period statistics for 1 minute...');
      await new Promise(res => setTimeout(res, 60000));

      riskManagementApi.removePeriodStatisticsListener(listenerId);
      log('Listener removed');
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
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Risk Management: Period Statistics</h1>
      <form onSubmit={triggerToFetchData} onReset={reset} className="mt-4 space-y-4">
        <label className="block text-gray-700 dark:text-gray-300">Account ID</label>
        <input className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" value={accountId} onChange={e => setAccountId(e.target.value)} />
        <label className="block text-gray-700 dark:text-gray-300">Token</label>
        <input className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" value={token} onChange={e => setToken(e.target.value)} />
        <label className="block text-gray-700 dark:text-gray-300">Domain</label>
        <input className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" value={domain} onChange={e => setDomain(e.target.value)} />
        <button type="submit" disabled={isConnecting || isConnected} className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400">Connect</button>
        <button type="reset" className="w-full py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Reset</button>
      </form>
      {!areResourcesNarrowedDown && (
        <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-200 rounded">
          <h2 className="font-bold">Warning</h2>
          <p>It seems like you are using an admin API token.</p>
          <p>Please use a secure token management system.</p>
        </div>
      )}
    </div>
  );
}
