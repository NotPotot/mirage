'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart';
import type { Product } from '@/lib/products';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/products/${product.id}`}>
        <div className="h-48 bg-gray-50 flex items-center justify-center text-6xl">
          {product.image}
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-blue-600">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mt-1">{product.category}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          <button
            onClick={() => addItem(product)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
