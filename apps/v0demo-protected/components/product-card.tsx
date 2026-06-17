'use client'

import Image from 'next/image'
import { Check, Plus } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '@/components/store-provider'
import { formatPrice, type Product } from '@/lib/products'

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useStore()
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-secondary/50">
        <Image
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          {product.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-medium leading-tight text-pretty">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-semibold">
            {formatPrice(product.price)}
          </span>
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
            className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {added ? (
              <>
                <Check className="size-4" /> Added
              </>
            ) : (
              <>
                <Plus className="size-4" /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  )
}
