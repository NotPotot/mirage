'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart';

export function CheckoutForm() {
  const { total, clearCart } = useCart();
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-900">Order Placed!</h2>
        <p className="text-gray-500 mt-2">Thank you for your purchase.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        clearCart();
        setSubmitted(true);
      }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Shipping Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            name="address"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Payment Information
        </h3>
        <p className="text-xs text-green-600 font-medium mb-4">
          🛡️ These fields are protected by CipherHacks DOM Shield — values are
          obfuscated in the DOM
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Number
          </label>
          <input
            type="text"
            name="cardNumber"
            id="card-number"
            data-sensitive="true"
            placeholder="1234 5678 9012 3456"
            required
            maxLength={19}
            className="w-full border border-green-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
          />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry
            </label>
            <input
              type="text"
              name="cardExpiry"
              id="card-expiry"
              data-sensitive="true"
              placeholder="MM/YY"
              required
              maxLength={5}
              className="w-full border border-green-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVV
            </label>
            <input
              type="text"
              name="cardCvv"
              id="card-cvv"
              data-sensitive="true"
              placeholder="123"
              required
              maxLength={4}
              className="w-full border border-green-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cardholder
            </label>
            <input
              type="text"
              name="cardHolder"
              id="card-holder"
              data-sensitive="true"
              placeholder="John Doe"
              required
              className="w-full border border-green-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between text-lg font-bold text-gray-900 mb-4">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Place Order
        </button>
      </div>
    </form>
  );
}
