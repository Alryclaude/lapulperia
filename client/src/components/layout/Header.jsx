import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  Settings,
  Heart,
  Package,
  Store,
  LayoutDashboard,
  ChevronDown,
  Hexagon,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { Logo } from '../Logo';

// REVAMP: Enhanced Header with glass effect and vibrant accents
const Header = ({ isPulperia = false }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = getTotalItems();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-400/80 backdrop-blur-xl border-b border-white/[0.08] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to={isPulperia ? '/dashboard' : '/'}
            className="flex items-center gap-2 group"
          >
            <Logo size="sm" showText={true} />
          </Link>

          {/* Search - Desktop - REVAMP: Better styling */}
          {!isPulperia && (
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar productos, pulperias..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-dark-100/80 border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-gray-500 focus:bg-dark-100 focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 focus:shadow-[0_0_20px_rgba(220,38,38,0.15)] transition-all duration-300"
                />
              </div>
            </form>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {/* Search icon - Mobile */}
            {!isPulperia && (
              <Link
                to="/search"
                className="md:hidden p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                <Search className="w-5 h-5" />
              </Link>
            )}

            {/* Cart - REVAMP: Better badge styling */}
            {isAuthenticated && !isPulperia && (
              <Link
                to="/cart"
                className="relative p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 bg-gradient-to-br from-primary-500 to-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(220,38,38,0.5)]"
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </motion.span>
                )}
              </Link>
            )}

            {/* User Menu - REVAMP: Enhanced dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-1.5 hover:bg-white/10 rounded-xl transition-all duration-200"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-xl object-cover ring-2 ring-primary-500/40"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500/30 to-primary-600/20 flex items-center justify-center ring-2 ring-primary-500/40">
                      <User className="w-4 h-4 text-primary-400" />
                    </div>
                  )}
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 hidden sm:block ${menuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown - REVAMP: Better animation and styling */}
                <AnimatePresence>
                  {menuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-60 bg-dark-100/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/[0.08] py-2 z-50 overflow-hidden"
                      >
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-white/[0.08] bg-gradient-to-r from-primary-500/10 to-transparent">
                          <p className="font-semibold text-white truncate">{user.name}</p>
                          <p className="text-sm text-gray-400 truncate">{user.email}</p>
                        </div>

                        {/* Menu items */}
                        <div className="py-1">
                          {user.role === 'PULPERIA' && !isPulperia && (
                            <Link
                              to="/dashboard"
                              onClick={() => setMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                            >
                              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <LayoutDashboard className="w-4 h-4 text-purple-400" />
                              </div>
                              <span>Centro de Comando</span>
                            </Link>
                          )}

                          {user.role === 'PULPERIA' && isPulperia && (
                            <Link
                              to="/"
                              onClick={() => setMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                            >
                              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                <Store className="w-4 h-4 text-cyan-400" />
                              </div>
                              <span>Ver Marketplace</span>
                            </Link>
                          )}

                          <Link
                            to="/orders"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                              <Package className="w-4 h-4 text-green-400" />
                            </div>
                            <span>Mis Pedidos</span>
                          </Link>

                          <Link
                            to="/favorites"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                              <Heart className="w-4 h-4 text-pink-400" />
                            </div>
                            <span>Favoritos</span>
                          </Link>

                          <Link
                            to="/passport"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                              <Hexagon className="w-4 h-4 text-amber-400" />
                            </div>
                            <span>Mi Pasaporte</span>
                          </Link>

                          <Link
                            to="/settings"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-gray-500/20 flex items-center justify-center">
                              <Settings className="w-4 h-4 text-gray-400" />
                            </div>
                            <span>Configuración</span>
                          </Link>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-white/[0.08] pt-1 mt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full"
                          >
                            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                              <LogOut className="w-4 h-4 text-red-400" />
                            </div>
                            <span>Cerrar Sesión</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-gradient-to-br from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-xl shadow-[0_4px_14px_rgba(220,38,38,0.4)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.5)] hover:-translate-y-0.5 transition-all duration-200"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
