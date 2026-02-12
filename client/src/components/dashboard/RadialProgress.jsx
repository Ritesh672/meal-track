import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const RadialProgress = ({ value, maxValue, label, color, unit }) => {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  const remaining = Math.max(0, maxValue - value);
  
  const data = [
    { name: 'Consumed', value: value },
    { name: 'Remaining', value: remaining },
  ];

  return (
    <div className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl shadow-sm border border-gray-200 w-full aspect-square max-w-[200px] mx-auto">
      <div className="relative w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="80%"
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
              cornerRadius={10}
            >
              <Cell key="consumed" fill={color} />
              <Cell key="remaining" fill="#f3f4f6" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-gray-900">{Math.round(value)}</span>
          <span className="text-xs text-gray-500">{unit}</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <h3 className="text-sm font-medium text-gray-700">{label}</h3>
        <p className="text-xs text-xs text-gray-500">{Math.round(maxValue)} target</p>
      </div>
    </div>
  );
};

export default RadialProgress;
