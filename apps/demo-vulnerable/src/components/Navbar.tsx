'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart';

export function Navbar() {
  const { itemCount } = useCart();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900">
          TechShop
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Products
          </Link>
          <Link
            href="/cart"
            className="relative text-gray-600 hover:text-gray-900"
          >
            Cart
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-4 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
