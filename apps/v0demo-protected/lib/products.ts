export type Product = {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
}

export const products: Product[] = [
  {
    id: 'nimbus-headphones',
    name: 'Aurora Wireless Headphones',
    description: 'Over-ear active noise cancellation with 40-hour battery life.',
    price: 249.0,
    image: '/products/headphones.png',
    category: 'Audio',
  },
  {
    id: 'nimbus-smartwatch',
    name: 'Pulse Smartwatch',
    description: 'Health tracking, GPS, and always-on AMOLED display.',
    price: 199.0,
    image: '/products/smartwatch.png',
    category: 'Wearables',
  },
  {
    id: 'nimbus-speaker',
    name: 'Echo Portable Speaker',
    description: 'Room-filling 360° sound that fits in your bag.',
    price: 89.0,
    image: '/products/speaker.png',
    category: 'Audio',
  },
  {
    id: 'nimbus-keyboard',
    name: 'Tactile Mechanical Keyboard',
    description: 'Hot-swappable switches with a compact 75% layout.',
    price: 129.0,
    image: '/products/keyboard.png',
    category: 'Accessories',
  },
  {
    id: 'nimbus-mouse',
    name: 'Glide Ergonomic Mouse',
    description: 'Silent clicks and precision tracking for all-day comfort.',
    price: 59.0,
    image: '/products/mouse.png',
    category: 'Accessories',
  },
  {
    id: 'nimbus-webcam',
    name: 'Clarity 4K Webcam',
    description: 'Crisp 4K video with auto-framing and low-light boost.',
    price: 119.0,
    image: '/products/webcam.png',
    category: 'Accessories',
  },
  {
    id: 'nimbus-charger',
    name: 'PowerHub USB-C Charger',
    description: '100W multi-port charger for laptops, phones, and tablets.',
    price: 49.0,
    image: '/products/charger.png',
    category: 'Power',
  },
  {
    id: 'nimbus-earbuds',
    name: 'Drift Wireless Earbuds',
    description: 'Compact earbuds with spatial audio and a pocket case.',
    price: 139.0,
    image: '/products/earbuds.png',
    category: 'Audio',
  },
  {
    id: 'nimbus-backpack',
    name: 'Voyager Tech Backpack',
    description: 'Weatherproof everyday carry with a padded laptop sleeve.',
    price: 109.0,
    image: '/products/backpack.png',
    category: 'Bags',
  },
  {
    id: 'nimbus-monitor',
    name: 'Vista 27" 4K Monitor',
    description: 'Color-accurate 4K panel with a near-borderless design.',
    price: 379.0,
    image: '/products/monitor.png',
    category: 'Displays',
  },
]

export function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}
