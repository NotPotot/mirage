export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

export const products: Product[] = [
  {
    id: 'wireless-earbuds',
    name: 'ProSound Wireless Earbuds',
    price: 79.99,
    description: 'Premium wireless earbuds with active noise cancellation, 30-hour battery life, and crystal-clear audio.',
    image: '🎧',
    category: 'Audio',
  },
  {
    id: 'smart-watch',
    name: 'TechFit Smart Watch',
    price: 249.99,
    description: 'Advanced fitness tracking, heart rate monitoring, GPS, and 5-day battery life in a sleek design.',
    image: '⌚',
    category: 'Wearables',
  },
  {
    id: 'mechanical-keyboard',
    name: 'TypeMaster RGB Keyboard',
    price: 129.99,
    description: 'Hot-swappable mechanical keyboard with per-key RGB lighting, USB-C, and aluminum frame.',
    image: '⌨️',
    category: 'Peripherals',
  },
  {
    id: 'portable-charger',
    name: 'PowerVault 20000mAh',
    price: 49.99,
    description: 'Ultra-slim portable charger with 65W USB-C PD, charge your laptop and phone simultaneously.',
    image: '🔋',
    category: 'Accessories',
  },
  {
    id: 'webcam-4k',
    name: 'ClearView 4K Webcam',
    price: 159.99,
    description: '4K webcam with auto-focus, noise-canceling mic, and built-in privacy shutter.',
    image: '📷',
    category: 'Peripherals',
  },
  {
    id: 'gaming-mouse',
    name: 'SwiftClick Pro Mouse',
    price: 89.99,
    description: 'Lightweight gaming mouse with 25,600 DPI sensor, 70-hour battery, and 6 programmable buttons.',
    image: '🖱️',
    category: 'Peripherals',
  },
];

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
