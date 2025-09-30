import React from 'react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const SalesChart = ({ data, chartType }) => {
    // Validar datos
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                    <p>No hay datos disponibles</p>
                </div>
            </div>
        );
    }

    // Filtrar datos válidos
    const validData = data.filter(item =>
        item &&
        typeof item.name === 'string' &&
        typeof item.value === 'number' &&
        !isNaN(item.value) &&
        item.value >= 0
    );

    if (validData.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                    <p>No hay datos válidos</p>
                </div>
            </div>
        );
    }

    const renderChart = () => {
        switch (chartType) {
            case 'bar':
                return (
                    <BarChart data={validData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                );

            case 'line':
                return (
                    <LineChart data={validData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                );

            case 'area':
                return (
                    <AreaChart data={validData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                );

            case 'pie':
                return (
                    <PieChart>
                        <Pie
                            data={validData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {validData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                );

            default:
                return (
                    <BarChart data={validData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                );
        }
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
        </ResponsiveContainer>
    );
};

export default SalesChart;