'use client';

import { useState } from 'react';
import { ShoppingCart, Star, Package, Home, LayoutGrid, Info } from 'lucide-react';

interface MockEcommerceProps {
  onEvent: (name: string, data?: Record<string, unknown>) => void;
}

const products = [
  { id: 'p1', name: 'Wireless Headphones', price: 79.99, rating: 4.5, reviews: 142 },
  { id: 'p2', name: 'Mechanical Keyboard', price: 129.99, rating: 4.8, reviews: 89 },
  { id: 'p3', name: 'USB-C Hub', price: 49.99, rating: 4.2, reviews: 215 },
];

type Page = 'home' | 'products' | 'about';

export function MockEcommerce({ onEvent }: MockEcommerceProps) {
  const [cartCount, setCartCount] = useState(0);
  const [addedProduct, setAddedProduct] = useState<string | null>(null);
  const [isInternal, setIsInternal] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('products');

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

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    onEvent('page_view', {
      page_path: `/${page}`,
      userType: isInternal ? 'internal' : 'external',
    });
  };

  const toggleUserType = (internal: boolean) => {
    setIsInternal(internal);
    onEvent('page_view', {
      page_path: `/${currentPage}`,
      userType: internal ? 'internal' : 'external',
    });
  };

  return (
    <div className="min-h-full bg-gray-50">
      {/* Store Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="font-bold text-gray-800">TechStore</div>
        <nav className="flex gap-4 text-sm text-gray-600">
          <button
            onClick={() => handleNavigate('home')}
            className={`flex items-center gap-1 transition-colors ${currentPage === 'home' ? 'text-blue-600 font-medium' : 'hover:text-blue-600'}`}
          >
            <Home className="h-3 w-3" />
            Home
          </button>
          <button
            onClick={() => handleNavigate('products')}
            className={`flex items-center gap-1 transition-colors ${currentPage === 'products' ? 'text-blue-600 font-medium' : 'hover:text-blue-600'}`}
          >
            <LayoutGrid className="h-3 w-3" />
            Products
          </button>
          <button
            onClick={() => handleNavigate('about')}
            className={`flex items-center gap-1 transition-colors ${currentPage === 'about' ? 'text-blue-600 font-medium' : 'hover:text-blue-600'}`}
          >
            <Info className="h-3 w-3" />
            About
          </button>
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

      {/* Traffic type simulator — only relevant for Challenge 1-3 */}
      <div className="mx-4 mt-3 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-yellow-900">Challenge 1-3 — Traffic type simulator:</span>
          <button
            onClick={() => toggleUserType(false)}
            className={`text-xs px-2 py-0.5 rounded-full transition-colors ${!isInternal ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}
          >
            External visitor
          </button>
          <button
            onClick={() => toggleUserType(true)}
            className={`text-xs px-2 py-0.5 rounded-full transition-colors ${isInternal ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}
          >
            Internal employee
          </button>
          <span className="text-xs text-yellow-700">
            → sets <code className="bg-yellow-100 px-1 rounded font-mono">dataLayer.userType = &quot;{isInternal ? 'internal' : 'external'}&quot;</code>
          </span>
        </div>
        <p className="text-xs text-yellow-700 mt-1">
          Toggle this to simulate how your GTM filter should block employee traffic. Click a nav link after switching to fire a page_view event with the updated userType.
        </p>
      </div>

      {/* Page content */}
      <div className="px-4 py-4">
        {currentPage === 'home' && (
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to TechStore</h1>
            <p className="text-gray-500 text-sm mb-4">Your one-stop shop for tech accessories.</p>
            <button
              onClick={() => handleNavigate('products')}
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Products →
            </button>
          </div>
        )}

        {currentPage === 'products' && (
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
        )}

        {currentPage === 'about' && (
          <div className="max-w-sm mx-auto py-6">
            <h1 className="text-xl font-bold text-gray-800 mb-3">About TechStore</h1>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              TechStore has been providing quality tech accessories since 2018. We pride ourselves on competitive pricing and fast shipping.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Our team of engineers curates every product in our catalog to ensure it meets our quality standards.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
