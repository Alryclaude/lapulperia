import { Package, Store, MapPin, SlidersHorizontal, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

// REVAMP: Enhanced SearchControls with vibrant styling
const SearchControls = ({
  view,
  onViewChange,
  gridView,
  onGridViewChange,
  showMap,
  onToggleMap,
  productsCount,
  pulperiasCount,
}) => {
  return (
    <div className="flex items-center gap-3">
      {/* Tabs - REVAMP: Better styling */}
      <Tabs
        value={view}
        onValueChange={onViewChange}
        className="flex-1"
      >
        <TabsList className="w-full sm:w-auto bg-dark-100/80 border border-white/[0.08] p-1">
          <TabsTrigger
            value="products"
            className="flex-1 sm:flex-none gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary-500 data-[state=active]:to-primary-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
          >
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Productos</span>
            {productsCount > 0 && (
              <Badge variant="secondary" size="sm" className="bg-white/20 text-white border-0">
                {productsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="pulperias"
            className="flex-1 sm:flex-none gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-cyan-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
          >
            <Store className="w-4 h-4" />
            <span className="hidden sm:inline">Pulperías</span>
            {pulperiasCount > 0 && (
              <Badge variant="secondary" size="sm" className="bg-white/20 text-white border-0">
                {pulperiasCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2">
        {/* View toggle - REVAMP: Better dark mode styling */}
        <div className="hidden sm:flex bg-dark-100/80 border border-white/[0.08] rounded-xl p-1">
          <button
            onClick={() => onGridViewChange(true)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              gridView
                ? 'bg-primary-500/20 text-primary-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onGridViewChange(false)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              !gridView
                ? 'bg-primary-500/20 text-primary-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Map toggle - REVAMP */}
        <Button
          variant={showMap ? 'cyan' : 'outline'}
          size="sm"
          onClick={onToggleMap}
          className={!showMap ? 'border-white/[0.08] text-gray-300 hover:text-white hover:border-cyan-500/50' : ''}
        >
          <MapPin className="w-4 h-4" />
          <span className="hidden sm:inline">
            {showMap ? 'Ocultar' : 'Mapa'}
          </span>
        </Button>

        {/* Filter sheet - REVAMP */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="border-white/[0.08] text-gray-300 hover:text-white hover:border-purple-500/50">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[60vh] bg-dark-200/95 backdrop-blur-xl border-white/[0.08]">
            <SheetHeader>
              <SheetTitle className="text-white">Filtrar resultados</SheetTitle>
            </SheetHeader>
            <div className="py-6 space-y-6">
              <div>
                <h4 className="font-semibold text-white mb-3">Categoría</h4>
                <div className="flex flex-wrap gap-2">
                  {['Todos', 'Abarrotes', 'Bebidas', 'Snacks', 'Lácteos', 'Limpieza'].map(
                    (cat, i) => (
                      <Badge
                        key={cat}
                        variant={i === 0 ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all duration-200 ${
                          i === 0
                            ? 'bg-gradient-to-br from-primary-500 to-primary-600 hover:shadow-lg'
                            : 'border-white/[0.08] text-gray-300 hover:border-primary-500/50 hover:text-white'
                        }`}
                      >
                        {cat}
                      </Badge>
                    )
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">Ordenar por</h4>
                <div className="flex flex-wrap gap-2">
                  {['Relevancia', 'Precio menor', 'Precio mayor', 'Cercanía'].map(
                    (opt, i) => (
                      <Badge
                        key={opt}
                        variant={i === 0 ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all duration-200 ${
                          i === 0
                            ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 hover:shadow-lg'
                            : 'border-white/[0.08] text-gray-300 hover:border-cyan-500/50 hover:text-white'
                        }`}
                      >
                        {opt}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </div>
            <Button className="w-full bg-gradient-to-br from-primary-500 to-primary-600 hover:shadow-[0_6px_20px_rgba(220,38,38,0.4)]">
              Aplicar filtros
            </Button>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default SearchControls;
