import { ToggleLeft, ToggleRight } from 'lucide-react';

const StatusToggle = ({ isOpen, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-medium transition-all ${
        isOpen
          ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:bg-green-600'
          : 'bg-dark-100 text-gray-300 border border-white/10 hover:bg-dark-50'
      }`}
    >
      {isOpen ? (
        <>
          <ToggleRight className="w-6 h-6" />
          Abierto
        </>
      ) : (
        <>
          <ToggleLeft className="w-6 h-6" />
          Cerrado
        </>
      )}
    </button>
  );
};

export default StatusToggle;
