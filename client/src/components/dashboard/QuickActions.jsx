import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Users, Target } from 'lucide-react';

const QuickActions = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Link
        to="/manage/orders"
        className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5 hover:border-primary-500/30 transition-all group"
      >
        <ShoppingBag className="w-8 h-8 text-primary-400 mb-3 group-hover:scale-110 transition-transform" />
        <h3 className="font-semibold text-white">Ordenes</h3>
        <p className="text-sm text-gray-400">Gestiona tus pedidos</p>
      </Link>

      <Link
        to="/manage/products"
        className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5 hover:border-blue-500/30 transition-all group"
      >
        <Package className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
        <h3 className="font-semibold text-white">Productos</h3>
        <p className="text-sm text-gray-400">Agrega y edita</p>
      </Link>

      <Link
        to="/manage/jobs"
        className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5 hover:border-purple-500/30 transition-all group"
      >
        <Users className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
        <h3 className="font-semibold text-white">Empleos</h3>
        <p className="text-sm text-gray-400">Publica vacantes</p>
      </Link>

      <Link
        to="/pulperia/settings"
        className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5 hover:border-green-500/30 transition-all group"
      >
        <Target className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
        <h3 className="font-semibold text-white">Perfil</h3>
        <p className="text-sm text-gray-400">Configura tu negocio</p>
      </Link>
    </div>
  );
};

export default QuickActions;
