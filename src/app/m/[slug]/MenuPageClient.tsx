'use client'

import { useState } from 'react'
import type { Restaurant, MenuItem, MenuCategoryWithItems, OrderItem } from '@/lib/types'

interface Props {
  restaurant: Restaurant
  categories: MenuCategoryWithItems[]
  uncategorized: MenuItem[]
}

export default function MenuPageClient({ restaurant, categories, uncategorized }: Props) {
  const [cart, setCart] = useState<OrderItem[]>([])
  const [tableNumber, setTableNumber] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [showCart, setShowCart] = useState(false)
  const [ordering, setOrdering] = useState(false)
  const [orderDone, setOrderDone] = useState(false)
  const [orderId, setOrderId] = useState('')

  const allItems = [...uncategorized, ...categories.flatMap(c => c.menu_items)]

  function addToCart(item: MenuItem) {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { id: item.id, name_ko: item.name_ko, name_en: item.name_en, quantity: 1, price: item.price }]
    })
  }

  function removeFromCart(id: string) {
    setCart(prev => {
      const existing = prev.find(i => i.id === id)
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i)
      }
      return prev.filter(i => i.id !== id)
    })
  }

  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const totalCount = cart.reduce((sum, i) => sum + i.quantity, 0)

  async function handleOrder() {
    if (cart.length === 0) return
    setOrdering(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: restaurant.id,
          table_number: tableNumber,
          items: cart,
          total_price: totalPrice,
          tourist_language: 'en',
          special_requests: specialRequests,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOrderDone(true)
      setOrderId(data.orderId)
    } catch {
      alert('Order failed. Please try again.')
    } finally {
      setOrdering(false)
    }
  }

  if (orderDone) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order placed!</h1>
          <p className="text-gray-600 mb-1">Order #{orderId.slice(0, 8)}</p>
          {tableNumber && <p className="text-gray-600">Table: {tableNumber}</p>}
          <p className="text-gray-500 text-sm mt-4">The restaurant has been notified. Please wait.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">{restaurant.name_en || restaurant.name}</h1>
        <p className="text-sm text-gray-500">{restaurant.description_en || 'Welcome!'}</p>
      </div>

      {/* Menu */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-6">
        {categories.map(cat => (
          <section key={cat.id}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {cat.name_en || cat.name_ko}
            </h2>
            <div className="space-y-2">
              {cat.menu_items.map(item => (
                <MenuItemCard key={item.id} item={item} cart={cart} onAdd={addToCart} onRemove={removeFromCart} />
              ))}
            </div>
          </section>
        ))}
        {uncategorized.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Menu</h2>
            <div className="space-y-2">
              {uncategorized.map(item => (
                <MenuItemCard key={item.id} item={item} cart={cart} onAdd={addToCart} onRemove={removeFromCart} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Cart FAB */}
      {totalCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 max-w-2xl mx-auto">
          {showCart && (
            <div className="mb-4 space-y-3">
              <div className="space-y-1">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span>{item.name_en} × {item.quantity}</span>
                    <span>₩{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₩{totalPrice.toLocaleString()}</span>
                </div>
              </div>
              <input
                type="text" value={tableNumber} onChange={e => setTableNumber(e.target.value)}
                placeholder="Table number (optional)"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <textarea
                value={specialRequests} onChange={e => setSpecialRequests(e.target.value)}
                placeholder="Allergies or special requests (optional)"
                rows={2}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              />
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setShowCart(!showCart)}
              className="flex-1 border border-orange-500 text-orange-500 py-3 rounded-xl font-medium text-sm"
            >
              {showCart ? 'Hide cart' : `View cart (${totalCount})`} — ₩{totalPrice.toLocaleString()}
            </button>
            {showCart && (
              <button
                onClick={handleOrder}
                disabled={ordering}
                className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold text-sm hover:bg-orange-600 disabled:opacity-50"
              >
                {ordering ? 'Placing order...' : 'Place order'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function MenuItemCard({
  item, cart, onAdd, onRemove
}: {
  item: MenuItem
  cart: OrderItem[]
  onAdd: (item: MenuItem) => void
  onRemove: (id: string) => void
}) {
  const inCart = cart.find(i => i.id === item.id)

  return (
    <div className="bg-white rounded-xl border p-4 flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm">{item.name_en || item.name_ko}</p>
        {item.description_en && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description_en}</p>}
        <p className="text-sm font-semibold text-gray-800 mt-1">₩{item.price.toLocaleString()}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {inCart ? (
          <div className="flex items-center gap-2">
            <button onClick={() => onRemove(item.id)}
              className="w-7 h-7 rounded-full border border-orange-400 text-orange-500 font-bold text-lg leading-none flex items-center justify-center">
              −
            </button>
            <span className="w-4 text-center text-sm font-medium">{inCart.quantity}</span>
            <button onClick={() => onAdd(item)}
              className="w-7 h-7 rounded-full bg-orange-500 text-white font-bold text-lg leading-none flex items-center justify-center">
              +
            </button>
          </div>
        ) : (
          <button onClick={() => onAdd(item)}
            className="w-7 h-7 rounded-full bg-orange-500 text-white font-bold text-lg leading-none flex items-center justify-center">
            +
          </button>
        )}
      </div>
    </div>
  )
}
