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
      <Tabs
        value={view}
        onValueChange={onViewChange}
        className="flex-1"
      >
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="products" className="flex-1 sm:flex-none gap-2">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Productos</span>
            {productsCount > 0 && (
              <Badge variant="secondary" size="sm">
                {productsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pulperias" className="flex-1 sm:flex-none gap-2">
            <Store className="w-4 h-4" />
            <span className="hidden sm:inline">Pulperias</span>
            {pulperiasCount > 0 && (
              <Badge variant="secondary" size="sm">
                {pulperiasCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2">
        {/* View toggle */}
        <div className="hidden sm:flex border rounded-lg p-1">
          <button
            onClick={() => onGridViewChange(true)}
            className={`p-2 rounded ${
              gridView ? 'bg-primary-100 text-primary-600' : 'text-gray-400'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onGridViewChange(false)}
            className={`p-2 rounded ${
              !gridView ? 'bg-primary-100 text-primary-600' : 'text-gray-400'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Map toggle */}
        <Button
          variant={showMap ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleMap}
        >
          <MapPin className="w-4 h-4" />
          <span className="hidden sm:inline">
            {showMap ? 'Ocultar' : 'Mapa'}
          </span>
        </Button>

        {/* Filter sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[60vh]">
            <SheetHeader>
              <SheetTitle>Filtrar resultados</SheetTitle>
            </SheetHeader>
            <div className="py-6 space-y-6">
              <div>
                <h4 className="font-medium mb-3">Categoria</h4>
                <div className="flex flex-wrap gap-2">
                  {['Todos', 'Abarrotes', 'Bebidas', 'Snacks', 'Lacteos', 'Limpieza'].map(
                    (cat) => (
                      <Badge
                        key={cat}
                        variant={cat === 'Todos' ? 'default' : 'outline'}
                        className="cursor-pointer"
                      >
                        {cat}
                      </Badge>
                    )
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Ordenar por</h4>
                <div className="flex flex-wrap gap-2">
                  {['Relevancia', 'Precio menor', 'Precio mayor', 'Cercania'].map(
                    (opt) => (
                      <Badge
                        key={opt}
                        variant={opt === 'Relevancia' ? 'default' : 'outline'}
                        className="cursor-pointer"
                      >
                        {opt}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </div>
            <Button className="w-full">Aplicar filtros</Button>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default SearchControls;
