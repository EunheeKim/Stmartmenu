'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Order, OrderItem } from '@/lib/types'

const STATUS_LABELS: Record<string, string> = {
  pending: '대기 중',
  confirmed: '접수됨',
  ready: '준비 완료',
  completed: '완료',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  ready: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-500',
}

const NEXT_STATUS: Record<string, string> = {
  pending: 'confirmed',
  confirmed: 'ready',
  ready: 'completed',
}

export default function OrdersList({ orders, restaurantId }: { orders: Order[]; restaurantId: string }) {
  const router = useRouter()

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-5xl mb-4">🛎️</p>
        <p>아직 주문이 없습니다.</p>
        <p className="text-sm mt-2">QR 코드를 부착하면 주문이 여기에 나타납니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={() => router.refresh()}
          className="text-sm text-gray-500 hover:text-gray-700 border px-3 py-1.5 rounded-lg"
        >
          새로고침
        </button>
      </div>
      {orders.map(order => (
        <OrderCard key={order.id} order={order} onRefresh={() => router.refresh()} />
      ))}
    </div>
  )
}

function OrderCard({ order, onRefresh }: { order: Order; onRefresh: () => void }) {
  const [updating, setUpdating] = useState(false)
  const supabase = createClient()

  const createdAt = new Date(order.created_at).toLocaleString('ko-KR', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  async function advanceStatus() {
    const next = NEXT_STATUS[order.status]
    if (!next) return
    setUpdating(true)
    await supabase.from('orders').update({ status: next }).eq('id', order.id)
    setUpdating(false)
    onRefresh()
  }

  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-gray-400">#{order.id.slice(0, 8)}</span>
            {order.table_number && (
              <span className="text-sm font-medium text-gray-700">테이블 {order.table_number}</span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
              {STATUS_LABELS[order.status]}
            </span>
          </div>
          <div className="space-y-0.5">
            {(order.items as OrderItem[]).map((item, i) => (
              <p key={i} className="text-sm text-gray-700">
                {item.name_ko} ({item.name_en}) × {item.quantity}
                <span className="text-gray-400 ml-1">₩{(item.price * item.quantity).toLocaleString()}</span>
              </p>
            ))}
          </div>
          {order.special_requests && (
            <p className="text-xs text-orange-700 bg-orange-50 rounded px-2 py-1 mt-2">
              특이사항: {order.special_requests}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-gray-900">₩{order.total_price.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mb-2">{createdAt}</p>
          {NEXT_STATUS[order.status] && (
            <button
              onClick={advanceStatus}
              disabled={updating}
              className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              {updating ? '...' : `→ ${STATUS_LABELS[NEXT_STATUS[order.status]]}`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
