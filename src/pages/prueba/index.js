import { useState } from "react";
import { RiskManagementEquityChartStream } from "./riskManagement/equityChartStream";
import { RiskManagementEquityTracking } from "./riskManagement/equityTracking";
import { RiskManagementEqulityBalance } from "./riskManagement/equlityBalance";
import { RiskManagementPeriodStatistics } from "./riskManagement/periodStatisticsStream";

const Prueba = () => {
    const [activeComponent, setActiveComponent] = useState(null);



  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 shadow-lg rounded-lg">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center">
        Risk Management Dashboard
      </h1>
      <div className="flex justify-center space-x-2 mt-4">
        <button
          onClick={() => setActiveComponent("equityChart")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Equity Chart
        </button>
        <button
          onClick={() => setActiveComponent("equityTracking")}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Equity Tracking
        </button>
        <button
          onClick={() => setActiveComponent("equityBalance")}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Equity Balance
        </button>
        <button
          onClick={() => setActiveComponent("periodStatistics")}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Period Statistics
        </button>
      </div>

      <div className="mt-6">
        {activeComponent === "equityChart" && <RiskManagementEquityChartStream />}
        {activeComponent === "equityTracking" && <RiskManagementEquityTracking/>}
        {activeComponent === "equityBalance" && <RiskManagementEqulityBalance />}
        {activeComponent === "periodStatistics" && <RiskManagementPeriodStatistics />}
      </div>
    </div>
  );
};

export default Prueba;
