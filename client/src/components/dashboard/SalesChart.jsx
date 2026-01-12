import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp, TrendingDown } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const SalesChart = ({ dailyRevenue = [] }) => {
  const chartData = useMemo(() => {
    const labels = dailyRevenue.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('es-HN', { weekday: 'short', day: 'numeric' });
    });

    const revenues = dailyRevenue.map(d => d.revenue);

    return {
      labels,
      datasets: [
        {
          fill: true,
          label: 'Ventas (L.)',
          data: revenues,
          borderColor: 'rgb(220, 38, 38)',
          backgroundColor: 'rgba(220, 38, 38, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          pointBackgroundColor: 'rgb(220, 38, 38)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [dailyRevenue]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 17, 17, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (items) => items[0]?.label || '',
          label: (item) => `L. ${item.raw.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: {
            size: 11,
          },
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: {
            size: 11,
          },
          callback: (value) => `L. ${value}`,
        },
        border: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  // Calculate trend
  const trend = useMemo(() => {
    if (dailyRevenue.length < 2) return { percentage: 0, isPositive: true };

    const recent = dailyRevenue.slice(-3).reduce((sum, d) => sum + d.revenue, 0) / 3;
    const previous = dailyRevenue.slice(0, 3).reduce((sum, d) => sum + d.revenue, 0) / 3;

    if (previous === 0) return { percentage: 0, isPositive: true };

    const percentage = ((recent - previous) / previous) * 100;
    return {
      percentage: Math.abs(percentage).toFixed(1),
      isPositive: percentage >= 0,
    };
  }, [dailyRevenue]);

  const totalRevenue = dailyRevenue.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = dailyRevenue.reduce((sum, d) => sum + d.orders, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-100/80 backdrop-blur-sm rounded-2xl border border-white/[0.08] p-5 relative overflow-hidden"
    >
      {/* Gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-transparent" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-400" />
              Ventas - Ultimos 7 Dias
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Total: L. {totalRevenue.toFixed(2)} ({totalOrders} ordenes)
            </p>
          </div>

          {/* Trend indicator */}
          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium ${
            trend.isPositive
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {trend.percentage}%
          </div>
        </div>

        {/* Chart */}
        <div className="h-[200px] mt-4">
          {dailyRevenue.length > 0 ? (
            <Line data={chartData} options={options} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No hay datos de ventas aun
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SalesChart;
