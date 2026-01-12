import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Trophy } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TopProductsChart = ({ products = [] }) => {
  const chartData = useMemo(() => {
    const labels = products.map(p => {
      // Truncate long names
      return p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name;
    });

    const quantities = products.map(p => p.quantity);

    // Generate gradient colors from gold to orange
    const colors = [
      'rgba(251, 191, 36, 0.8)',  // Gold
      'rgba(251, 146, 60, 0.8)',  // Orange
      'rgba(234, 88, 12, 0.7)',   // Darker orange
      'rgba(194, 65, 12, 0.6)',   // Brown-orange
      'rgba(154, 52, 18, 0.5)',   // Dark brown
    ];

    const borderColors = [
      'rgb(251, 191, 36)',
      'rgb(251, 146, 60)',
      'rgb(234, 88, 12)',
      'rgb(194, 65, 12)',
      'rgb(154, 52, 18)',
    ];

    return {
      labels,
      datasets: [
        {
          label: 'Unidades vendidas',
          data: quantities,
          backgroundColor: colors.slice(0, products.length),
          borderColor: borderColors.slice(0, products.length),
          borderWidth: 1,
          borderRadius: 6,
          barThickness: 24,
        },
      ],
    };
  }, [products]);

  const options = {
    indexAxis: 'y',
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
          title: (items) => {
            const index = items[0]?.dataIndex;
            return products[index]?.name || '';
          },
          label: (item) => `${item.raw} unidades vendidas`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
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
          display: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 11,
          },
        },
        border: {
          display: false,
        },
      },
    },
  };

  const totalSold = products.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-dark-100/80 backdrop-blur-sm rounded-2xl border border-white/[0.08] p-5 relative overflow-hidden"
    >
      {/* Gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-500/10 via-transparent to-transparent" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent-400" />
              Productos Top
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {totalSold} unidades vendidas este mes
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[200px] mt-4">
          {products.length > 0 ? (
            <Bar data={chartData} options={options} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No hay datos de productos aun
            </div>
          )}
        </div>

        {/* Top 3 badges */}
        {products.length > 0 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {products.slice(0, 3).map((product, index) => (
              <div
                key={product.productId}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                  index === 0
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : index === 1
                    ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                    : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                }`}
              >
                <span className="font-bold">#{index + 1}</span>
                <span className="truncate max-w-[100px]">{product.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TopProductsChart;
