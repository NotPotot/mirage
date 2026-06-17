'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <Link
          href="/"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4"
          >
            <div className="text-4xl w-16 text-center">{item.product.image}</div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {item.product.name}
              </h3>
              <p className="text-gray-500 text-sm">
                ${item.product.price.toFixed(2)} each
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  updateQuantity(item.product.id, item.quantity - 1)
                }
                className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
              >
                -
              </button>
              <span className="w-8 text-center font-medium">
                {item.quantity}
              </span>
              <button
                onClick={() =>
                  updateQuantity(item.product.id, item.quantity + 1)
                }
                className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
              >
                +
              </button>
            </div>
            <div className="w-24 text-right font-semibold">
              ${(item.product.price * item.quantity).toFixed(2)}
            </div>
            <button
              onClick={() => removeItem(item.product.id)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
        <span className="text-lg font-bold text-gray-900">Total</span>
        <span className="text-lg font-bold text-gray-900">
          ${total.toFixed(2)}
        </span>
      </div>
      <div className="mt-4 flex justify-end">
        <Link
          href="/checkout"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
