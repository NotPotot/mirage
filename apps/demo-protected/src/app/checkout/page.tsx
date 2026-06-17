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
          className="text-green-600 hover:underline mt-4 inline-block"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout</h1>
      <p className="text-green-600 text-sm font-medium mb-6">
        🛡️ This page is protected by CipherHacks — credit card data is
        obfuscated in the DOM, honeypots are active, and bot detection is running
      </p>
      <div className="bg-white rounded-lg border border-green-200 p-6">
        <CheckoutForm />
      </div>
    </div>
  );
}
