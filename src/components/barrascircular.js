import { useState, useEffect } from "react";

const CircularProgress = ({ percentage, size = 100, strokeWidth = 10, color = "green" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let start = 0;
    const stepTime = 20;
    const increment = percentage / 50;

    const interval = setInterval(() => {
      start += increment;
      if (start >= percentage) {
        start = percentage;
        clearInterval(interval);
      }
      setProgress(start);
    }, stepTime);
  }, [percentage]);

  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Fondo del círculo */}
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="#222" strokeWidth={strokeWidth} fill="none" />
      {/* Barra de progreso */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
      />
      {/* Texto del porcentaje */}
      <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="20" fill={color} fontWeight="bold">
        {Math.round(progress)}%
      </text>
    </svg>
  );
};

const Dashboard = () => {
  const data = {
    target: { value: 10000, current: 6305, percentage: 63, color: "green" },
    maxDrawdown: { value: 15100, current: 6000, percentage: 40, color: "red" },
    maxDailyLoss: { value: 5050, current: 1900, percentage: 38, color: "red" },
  };

  return (
    <div className="flex flex-col items-center justify-centerp-6 py-5 text-white">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.keys(data).map((key) => {
          const item = data[key];
          return (
            <div key={key} className="flex items-center gap-4">
              <CircularProgress percentage={item.percentage} color={item.color} />
              <div>
                <p className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                <p className="text-xl font-bold">${item.value.toFixed(2)}</p>
                <p className={item.color === "green" ? "text-green-400" : "text-red-400"}>Current</p>
                <p className={`${item.color === "green" ? "text-green-500" : "text-red-500"} font-bold`}>
                  ${item.current.toFixed(2)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
