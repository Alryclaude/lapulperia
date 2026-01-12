const TopProducts = ({ products }) => {
  return (
    <div className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5">
      <h3 className="font-semibold text-white mb-4">Productos Top</h3>
      {products?.length > 0 ? (
        <div className="space-y-3">
          {products.map((product, index) => (
            <div
              key={product.productId}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                index === 1 ? 'bg-gray-500/20 text-gray-400' :
                index === 2 ? 'bg-orange-500/20 text-orange-400' :
                'bg-dark-50 text-gray-500'
              }`}>
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{product.name}</p>
                <p className="text-sm text-gray-400">{product.quantity} vendidos</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No hay datos aun</p>
      )}
    </div>
  );
};

export default TopProducts;
