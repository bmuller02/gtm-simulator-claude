'use client';

import { useState } from 'react';
import { CheckCircle, ShoppingBag } from 'lucide-react';

interface MockCheckoutProps {
  onEvent: (name: string, data?: Record<string, unknown>) => void;
}

export function MockCheckout({ onEvent }: MockCheckoutProps) {
  const [page, setPage] = useState<'cart' | 'thankyou'>('cart');
  const [orderValue] = useState(129.99);

  const completePurchase = () => {
    setPage('thankyou');
    onEvent('purchase', {
      transactionRevenue: orderValue,
      transactionId: `ORD-${Date.now()}`,
      items: [{ name: 'Mechanical Keyboard', price: orderValue }],
    });
  };

  if (page === 'thankyou') {
    return (
      <div className="min-h-full bg-gray-50">
        <header className="bg-white border-b px-4 py-3">
          <div className="font-bold text-gray-800">TechStore</div>
        </header>
        <div className="px-4 py-10 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <h1 className="text-xl font-semibold text-gray-800 mb-1">Order Confirmed!</h1>
          <p className="text-sm text-gray-500 mb-2">Thank you for your purchase.</p>
          <div className="inline-block bg-green-50 border border-green-200 rounded-lg px-4 py-2 mt-2">
            <p className="text-xs text-green-700 font-medium">
              📡 URL is now <code className="bg-green-100 px-1 rounded">/thank-you</code>
            </p>
            <p className="text-xs text-green-600 mt-0.5">
              dataLayer: transactionRevenue = ${orderValue}
            </p>
          </div>
          <button
            onClick={() => setPage('cart')}
            className="mt-6 text-xs text-blue-600 underline"
          >
            ← Back to cart (simulate another purchase)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      <header className="bg-white border-b px-4 py-3">
        <div className="font-bold text-gray-800">TechStore</div>
      </header>
      <div className="px-4 py-6 max-w-sm mx-auto">
        <h1 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" /> Your Cart
        </h1>
        <div className="bg-white rounded-lg border p-4 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-700">Mechanical Keyboard</span>
            <span className="font-medium">${orderValue}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold text-sm">
            <span>Total</span>
            <span>${orderValue}</span>
          </div>
          <button
            onClick={completePurchase}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            Complete Purchase →
          </button>
          <p className="text-xs text-center text-gray-400">
            Clicking fires a &apos;purchase&apos; event + redirects to /thank-you
          </p>
        </div>
      </div>
    </div>
  );
}
