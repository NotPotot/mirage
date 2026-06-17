'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { Product } from '@/lib/products'

export type CartItem = {
  product: Product
  quantity: number
}

export type Order = {
  id: string
  createdAt: string
  customer: {
    name: string
    email: string
    address: string
    city: string
    state: string
    zip: string
  }
  // Stored only in the browser for this demo. Card number is masked.
  maskedCard: string
  cardholder: string
  items: { name: string; price: number; quantity: number }[]
  total: number
}

type StoreContextValue = {
  cart: CartItem[]
  orders: Order[]
  cartCount: number
  subtotal: number
  isCartOpen: boolean
  setCartOpen: (open: boolean) => void
  addToCart: (product: Product) => void
  removeFromCart: (id: string) => void
  setQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  addOrder: (order: Order) => void
  deleteOrder: (id: string) => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

const CART_KEY = 'nimbus-demo-cart'
const ORDERS_KEY = 'nimbus-demo-orders'

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isCartOpen, setCartOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_KEY)
      const storedOrders = localStorage.getItem(ORDERS_KEY)
      if (storedCart) setCart(JSON.parse(storedCart))
      if (storedOrders) setOrders(JSON.parse(storedOrders))
    } catch {
      // ignore corrupted demo state
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart, hydrated])

  useEffect(() => {
    if (hydrated) localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
  }, [orders, hydrated])

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
    setCartOpen(true)
  }, [])

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== id))
  }, [])

  const setQuantity = useCallback((id: string, quantity: number) => {
    setCart((prev) =>
      quantity <= 0
        ? prev.filter((item) => item.product.id !== id)
        : prev.map((item) =>
            item.product.id === id ? { ...item, quantity } : item,
          ),
    )
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => [order, ...prev])
  }, [])

  const deleteOrder = useCallback((id: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== id))
  }, [])

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  )

  const subtotal = useMemo(
    () =>
      cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart],
  )

  const value: StoreContextValue = {
    cart,
    orders,
    cartCount,
    subtotal,
    isCartOpen,
    setCartOpen,
    addToCart,
    removeFromCart,
    setQuantity,
    clearCart,
    addOrder,
    deleteOrder,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within a StoreProvider')
  return ctx
}
