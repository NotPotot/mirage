'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { CheckoutForm } from '@/components/CheckoutForm';

export default function CheckoutPage() {
  const { items } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Nothing to checkout</h2>
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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout</h1>
      <p className="text-red-600 text-sm font-medium mb-6">
        ⚠️ This page has NO CipherHacks protection — credit card data is fully
        visible in the DOM
      </p>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <CheckoutForm />
      </div>
    </div>
  );
}
