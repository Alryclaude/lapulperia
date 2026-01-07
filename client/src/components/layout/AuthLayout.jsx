import { Outlet, Link } from 'react-router-dom';
import { Store } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen relative z-10 flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm">
            <Store className="w-6 h-6 text-white" />
          </div>
          <span className="font-semibold text-white text-lg">La Pulperia</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-gray-400">
        <p>Digitalizando Honduras, un negocio a la vez</p>
      </footer>
    </div>
  );
};

export default AuthLayout;
