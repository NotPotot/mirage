import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { CartProvider } from '@/lib/cart';
import { ShieldWrapper } from '@/components/ShieldWrapper';

export const metadata: Metadata = {
  title: 'TechShop — Protected by CipherHacks',
  description: 'CipherHacks-protected e-commerce demo',
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
          <ShieldWrapper>
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
          </ShieldWrapper>
        </CartProvider>
      </body>
    </html>
  );
}
