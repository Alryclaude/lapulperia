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
import { Clock, Zap } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PeakHoursChart = ({ peakHours = [] }) => {
  // Create full 24-hour data from peak hours
  const fullHoursData = useMemo(() => {
    // Initialize all hours with 0
    const hours = {};
    for (let i = 0; i < 24; i++) {
      hours[i] = 0;
    }

    // Fill in peak hours data
    peakHours.forEach(ph => {
      hours[ph.hour] = ph.count;
    });

    return hours;
  }, [peakHours]);

  const chartData = useMemo(() => {
    // Only show business hours (6am - 10pm)
    const businessHours = [];
    for (let i = 6; i <= 22; i++) {
      businessHours.push({
        hour: i,
        count: fullHoursData[i] || 0,
        label: `${i}:00`,
      });
    }

    const maxCount = Math.max(...businessHours.map(h => h.count), 1);

    // Color gradient based on intensity
    const getColor = (count) => {
      const intensity = count / maxCount;
      if (intensity > 0.8) return { bg: 'rgba(220, 38, 38, 0.8)', border: 'rgb(220, 38, 38)' };
      if (intensity > 0.6) return { bg: 'rgba(249, 115, 22, 0.7)', border: 'rgb(249, 115, 22)' };
      if (intensity > 0.4) return { bg: 'rgba(251, 191, 36, 0.6)', border: 'rgb(251, 191, 36)' };
      if (intensity > 0.2) return { bg: 'rgba(34, 197, 94, 0.5)', border: 'rgb(34, 197, 94)' };
      return { bg: 'rgba(100, 116, 139, 0.3)', border: 'rgb(100, 116, 139)' };
    };

    const colors = businessHours.map(h => getColor(h.count));

    return {
      labels: businessHours.map(h => h.label),
      datasets: [
        {
          label: 'Ordenes',
          data: businessHours.map(h => h.count),
          backgroundColor: colors.map(c => c.bg),
          borderColor: colors.map(c => c.border),
          borderWidth: 1,
          borderRadius: 4,
          barThickness: 16,
        },
      ],
    };
  }, [fullHoursData]);

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
          title: (items) => `${items[0]?.label} hrs`,
          label: (item) => `${item.raw} ordenes`,
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
            size: 10,
          },
          maxRotation: 0,
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
          stepSize: 1,
        },
        border: {
          display: false,
        },
      },
    },
  };

  // Find peak hour
  const peakHour = useMemo(() => {
    if (peakHours.length === 0) return null;
    const sorted = [...peakHours].sort((a, b) => b.count - a.count);
    return sorted[0];
  }, [peakHours]);

  // Format hour for display
  const formatHour = (hour) => {
    if (hour === 0) return '12:00 AM';
    if (hour === 12) return '12:00 PM';
    if (hour < 12) return `${hour}:00 AM`;
    return `${hour - 12}:00 PM`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-dark-100/80 backdrop-blur-sm rounded-2xl border border-white/[0.08] p-5 relative overflow-hidden"
    >
      {/* Gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Horas Pico
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Ultimos 30 dias
            </p>
          </div>

          {/* Peak hour indicator */}
          {peakHour && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm font-medium border border-cyan-500/30">
              <Zap className="w-4 h-4" />
              {formatHour(peakHour.hour)}
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="h-[160px] mt-4">
          {peakHours.length > 0 ? (
            <Bar data={chartData} options={options} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No hay datos de horas pico aun
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-500/80"></div>
            <span>Muy alto</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-orange-500/70"></div>
            <span>Alto</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-yellow-500/60"></div>
            <span>Medio</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-500/50"></div>
            <span>Bajo</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PeakHoursChart;
