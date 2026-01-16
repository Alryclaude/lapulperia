import { Zap } from 'lucide-react';

const InsightsPanel = ({ insights }) => {
  return (
    <div className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5">
      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-400" />
        Radar de Ventas
      </h3>
      {insights?.length > 0 ? (
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="p-3 rounded-xl bg-gradient-to-r from-primary-500/10 to-blue-500/10 border border-primary-500/20"
            >
              <p className="text-gray-300">{insight.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">
          Las predicciones aparecerán cuando tengas más datos
        </p>
      )}
    </div>
  );
};

export default InsightsPanel;
