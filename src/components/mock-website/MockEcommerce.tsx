'use client';

import { useState } from 'react';
import { ShoppingCart, Star, Package } from 'lucide-react';

interface MockEcommerceProps {
  onEvent: (name: string, data?: Record<string, unknown>) => void;
}

const products = [
  { id: 'p1', name: 'Wireless Headphones', price: 79.99, rating: 4.5, reviews: 142 },
  { id: 'p2', name: 'Mechanical Keyboard', price: 129.99, rating: 4.8, reviews: 89 },
  { id: 'p3', name: 'USB-C Hub', price: 49.99, rating: 4.2, reviews: 215 },
];

export function MockEcommerce({ onEvent }: MockEcommerceProps) {
  const [cartCount, setCartCount] = useState(0);
  const [addedProduct, setAddedProduct] = useState<string | null>(null);
  const [isInternal, setIsInternal] = useState(false);

  const handleAddToCart = (product: typeof products[0]) => {
    setCartCount((c) => c + 1);
    setAddedProduct(product.id);
    setTimeout(() => setAddedProduct(null), 1500);
    onEvent('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
    });
  };

  const handlePageView = (page: string) => {
    onEvent('page_view', {
      page_path: page,
      userType: isInternal ? 'internal' : 'external',
    });
  };

  return (
    <div className="min-h-full bg-gray-50">
      {/* Store Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="font-bold text-gray-800">TechStore</div>
        <nav className="flex gap-4 text-sm text-gray-600">
          <button onClick={() => handlePageView('/home')} className="hover:text-blue-600 transition-colors">Home</button>
          <button onClick={() => handlePageView('/products')} className="hover:text-blue-600 transition-colors">Products</button>
          <button onClick={() => handlePageView('/about')} className="hover:text-blue-600 transition-colors">About</button>
        </nav>
        <div className="relative">
          <ShoppingCart className="h-5 w-5 text-gray-600" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </div>
      </header>

      <div className="px-4 py-4">
        {/* User type toggle (for challenge 1-3) */}
        <div className="mb-4 flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
          <span className="text-xs text-yellow-800 font-medium">Simulate user type:</span>
          <button
            onClick={() => setIsInternal(false)}
            className={`text-xs px-2 py-0.5 rounded-full transition-colors ${!isInternal ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}
          >
            External
          </button>
          <button
            onClick={() => setIsInternal(true)}
            className={`text-xs px-2 py-0.5 rounded-full transition-colors ${isInternal ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}
          >
            Internal (Employee)
          </button>
          <span className="text-xs text-yellow-700 ml-1">
            dataLayer: userType = &quot;{isInternal ? 'internal' : 'external'}&quot;
          </span>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg border p-4 flex gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-800 text-sm">{product.name}</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">({product.reviews})</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-semibold text-gray-900">${product.price}</span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className={`add-to-cart text-xs px-3 py-1.5 rounded-lg transition-all ${
                      addedProduct === product.id
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {addedProduct === product.id ? '✓ Added!' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
