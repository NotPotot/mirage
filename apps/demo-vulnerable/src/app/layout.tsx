import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { CartProvider } from '@/lib/cart';

export const metadata: Metadata = {
  title: 'TechShop — Vulnerable Demo',
  description: 'Unprotected e-commerce demo for CipherHacks',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <CartProvider>
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
