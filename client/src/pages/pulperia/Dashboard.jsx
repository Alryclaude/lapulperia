import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { statsApi, pulperiaApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';
import {
  StatusToggle,
  StatsCards,
  AchievementsBadges,
  QuickActions,
  TopProducts,
  InsightsPanel,
  ExportSection,
} from '../../components/dashboard';

const Dashboard = () => {
  const { user, refreshUser } = useAuthStore();
  const pulperia = user?.pulperia;

  const [isOpen, setIsOpen] = useState(pulperia?.status === 'OPEN');

  // Sync isOpen state when pulperia data changes
  useEffect(() => {
    if (pulperia?.status) {
      setIsOpen(pulperia.status === 'OPEN');
    }
  }, [pulperia?.status]);

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => statsApi.getDashboard(),
    refetchInterval: 30000,
  });

  const stats = statsData?.data || {};

  // Fetch insights
  const { data: insightsData } = useQuery({
    queryKey: ['insights'],
    queryFn: () => statsApi.getInsights(),
  });

  const insights = insightsData?.data?.insights || [];

  // Toggle open/closed status
  const handleToggleStatus = async () => {
    try {
      const newStatus = isOpen ? 'CLOSED' : 'OPEN';
      await pulperiaApi.updateStatus({ status: newStatus });
      setIsOpen(!isOpen);
      await refreshUser();
      toast.success(isOpen ? 'Pulperia cerrada' : 'Pulperia abierta!');
    } catch {
      toast.error('Error al cambiar estado');
    }
  };

  // Export data
  const handleExport = async (format) => {
    try {
      const response = await statsApi.export({ format });
      const isCSV = format === 'csv';
      const blob = new Blob(
        [isCSV ? response.data : JSON.stringify(response.data, null, 2)],
        { type: isCSV ? 'text/csv' : 'application/json' }
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = isCSV ? 'ventas.csv' : 'datos.json';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Datos exportados');
    } catch {
      toast.error('Error al exportar');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Centro de Comando</h1>
          <p className="text-gray-400">Bienvenido, {user?.name}</p>
        </div>
        <StatusToggle isOpen={isOpen} onToggle={handleToggleStatus} />
      </div>

      <StatsCards stats={stats} pulperia={pulperia} />

      <AchievementsBadges achievements={stats.achievements} />

      <QuickActions />

      {/* Top Products & Insights */}
      <div className="grid lg:grid-cols-2 gap-6">
        <TopProducts products={stats.topProducts} />
        <InsightsPanel insights={insights} />
      </div>

      <ExportSection onExport={handleExport} />
    </div>
  );
};

export default Dashboard;
