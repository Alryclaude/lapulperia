import { Download } from 'lucide-react';

const ExportSection = ({ onExport }) => {
  return (
    <div className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5">
      <h3 className="font-semibold text-white mb-4">Exportar Datos</h3>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onExport('csv')}
          className="flex items-center gap-2 px-4 py-2.5 bg-dark-50 text-gray-300 border border-white/10 rounded-xl hover:bg-dark-200 transition-colors"
        >
          <Download className="w-4 h-4" />
          Descargar CSV
        </button>
        <button
          onClick={() => onExport('json')}
          className="flex items-center gap-2 px-4 py-2.5 bg-dark-50 text-gray-300 border border-white/10 rounded-xl hover:bg-dark-200 transition-colors"
        >
          <Download className="w-4 h-4" />
          Descargar JSON
        </button>
      </div>
    </div>
  );
};

export default ExportSection;
