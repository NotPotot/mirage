'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getProduct } from '@/lib/products';
import { useCart } from '@/lib/cart';

export default function ProductPage() {
  const params = useParams();
  const product = getProduct(params.id as string);
  const { addItem } = useCart();

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
        <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/" className="text-blue-600 hover:underline text-sm">
        ← Back to products
      </Link>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg border border-gray-200 h-80 flex items-center justify-center text-8xl">
          {product.image}
        </div>
        <div>
          <span className="text-sm text-gray-500">{product.category}</span>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">
            {product.name}
          </h1>
          <p className="text-gray-600 mt-4">{product.description}</p>
          <p className="text-3xl font-bold text-gray-900 mt-6">
            ${product.price.toFixed(2)}
          </p>
          <button
            onClick={() => addItem(product)}
            className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
