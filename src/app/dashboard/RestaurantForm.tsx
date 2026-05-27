'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function RestaurantForm({ userId, email }: { userId: string; email: string }) {
  const [name, setName] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [notificationEmail, setNotificationEmail] = useState(email)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  function toSlug(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') +
      '-' + Math.random().toString(36).slice(2, 6)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const slug = toSlug(nameEn || name)

    const { error } = await supabase.from('restaurants').insert({
      owner_id: userId,
      name,
      name_en: nameEn || name,
      slug,
      email,
      notification_email: notificationEmail,
    })

    if (error) {
      setError('식당 등록에 실패했습니다. 다시 시도해주세요.')
      setLoading(false)
      return
    }

    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">식당 이름 (한국어)</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="예: 홍길동 식당"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">식당 이름 (영어, URL에 사용)</label>
        <input
          type="text"
          value={nameEn}
          onChange={e => setNameEn(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="예: Honggildong Restaurant"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">주문 알림 받을 이메일</label>
        <input
          type="email"
          value={notificationEmail}
          onChange={e => setNotificationEmail(e.target.value)}
          required
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-500 text-white py-2.5 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
      >
        {loading ? '등록 중...' : '식당 등록하기'}
      </button>
    </form>
  )
}
