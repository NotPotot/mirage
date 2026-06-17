'use client';

import { products } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard';

export default function HomePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">TechShop</h1>
        <p className="text-gray-500 mt-2">Premium electronics & accessories</p>
        <div className="mt-3 inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
          ⚠️ UNPROTECTED — No CipherHacks Shield
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
