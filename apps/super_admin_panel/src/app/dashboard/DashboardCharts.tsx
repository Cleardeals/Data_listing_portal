'use client';
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
  LineChart, Line,
  ResponsiveContainer
} from 'recharts';

const barData = [
  { name: 'A', value: 37 },
  { name: 'B', value: 66 },
  { name: 'C', value: 29 },
  { name: 'D', value: 58 },
];

const pieData = [
  { name: 'Group 1', value: 35 },
  { name: 'Group 2', value: 73 },
  { name: 'Group 3', value: 27 },
  { name: 'Group 4', value: 65 },
];
const COLORS = ['#8884d8', '#ffc658', '#ff6384', '#82ca9d'];

const lineData = [
  { name: 'A', value: 44 },
  { name: 'B', value: 73 },
  { name: 'C', value: 22 },
  { name: 'D', value: 66 },
];

const DashboardCharts = () => (
  <section className="dashboard-charts grid grid-cols-2 grid-rows-2 gap-6 p-8 border rounded-lg bg-white">
    {/* Bar Chart */}
    <div className="bg-blue-100 flex items-center justify-center h-64 rounded shadow">
      <ResponsiveContainer width="95%" height="90%">
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#4285F4" />
        </BarChart>
      </ResponsiveContainer>
    </div>
    {/* Pie Chart 1 */}
    <div className="bg-blue-50 flex items-center justify-center h-64 rounded shadow">
      <ResponsiveContainer width="95%" height="90%">
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#8884d8" label>
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
    {/* Pie Chart 2 */}
    <div className="bg-blue-50 flex items-center justify-center h-64 rounded shadow">
      <ResponsiveContainer width="95%" height="90%">
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={60} fill="#82ca9d" label>
            {pieData.map((entry, index) => (
              <Cell key={`cell2-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
    {/* Line Chart */}
    <div className="bg-blue-100 flex items-center justify-center h-64 rounded shadow">
      <ResponsiveContainer width="95%" height="90%">
        <LineChart data={lineData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#4285F4" fill="#4285F4" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </section>
);

export default DashboardCharts; 