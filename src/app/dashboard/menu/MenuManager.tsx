'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { MenuItem, MenuCategoryWithItems } from '@/lib/types'

interface Props {
  restaurantId: string
  categories: MenuCategoryWithItems[]
  uncategorized: MenuItem[]
}

export default function MenuManager({ restaurantId, categories, uncategorized }: Props) {
  const [showAddItem, setShowAddItem] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <button
          onClick={() => { setShowAddItem(true); setShowAddCategory(false) }}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600"
        >
          + 메뉴 추가
        </button>
        <button
          onClick={() => { setShowAddCategory(true); setShowAddItem(false) }}
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
        >
          + 카테고리 추가
        </button>
      </div>

      {showAddCategory && (
        <AddCategoryForm
          restaurantId={restaurantId}
          onDone={() => { setShowAddCategory(false); router.refresh() }}
          onCancel={() => setShowAddCategory(false)}
        />
      )}

      {showAddItem && (
        <AddMenuItemForm
          restaurantId={restaurantId}
          categories={categories}
          onDone={() => { setShowAddItem(false); router.refresh() }}
          onCancel={() => setShowAddItem(false)}
        />
      )}

      {categories.length === 0 && uncategorized.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-4">🍽️</p>
          <p>아직 메뉴가 없습니다. 메뉴를 추가해주세요.</p>
        </div>
      )}

      {categories.map(cat => (
        <CategorySection key={cat.id} category={cat} onRefresh={() => router.refresh()} />
      ))}

      {uncategorized.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">미분류</h3>
          <div className="space-y-2">
            {uncategorized.map(item => (
              <MenuItemRow key={item.id} item={item} onRefresh={() => router.refresh()} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CategorySection({ category, onRefresh }: { category: MenuCategoryWithItems; onRefresh: () => void }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold text-gray-800">{category.name_ko}</h3>
        {category.name_en && <span className="text-gray-400 text-sm">/ {category.name_en}</span>}
        <span className="text-xs text-gray-400">({category.menu_items?.length ?? 0}개)</span>
      </div>
      <div className="space-y-2">
        {(category.menu_items ?? []).map(item => (
          <MenuItemRow key={item.id} item={item} onRefresh={onRefresh} />
        ))}
      </div>
    </div>
  )
}

function MenuItemRow({ item, onRefresh }: { item: MenuItem; onRefresh: () => void }) {
  const supabase = createClient()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`"${item.name_ko}" 메뉴를 삭제할까요?`)) return
    setDeleting(true)
    await supabase.from('menu_items').delete().eq('id', item.id)
    onRefresh()
  }

  async function toggleAvailable() {
    await supabase.from('menu_items').update({ is_available: !item.is_available }).eq('id', item.id)
    onRefresh()
  }

  return (
    <div className={`flex items-center justify-between bg-white border rounded-lg px-4 py-3 ${!item.is_available ? 'opacity-50' : ''}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 text-sm">{item.name_ko}</span>
          {item.name_en && <span className="text-gray-400 text-xs">/ {item.name_en}</span>}
        </div>
        {item.description_ko && <p className="text-xs text-gray-500 mt-0.5 truncate">{item.description_ko}</p>}
      </div>
      <div className="flex items-center gap-3 ml-4">
        <span className="text-sm font-medium text-gray-700">₩{item.price.toLocaleString()}</span>
        <button
          onClick={toggleAvailable}
          className={`text-xs px-2 py-1 rounded-full ${item.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
        >
          {item.is_available ? '판매중' : '품절'}
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-400 hover:text-red-600 text-xs"
        >
          삭제
        </button>
      </div>
    </div>
  )
}

function AddCategoryForm({ restaurantId, onDone, onCancel }: {
  restaurantId: string; onDone: () => void; onCancel: () => void
}) {
  const [nameKo, setNameKo] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase.from('menu_categories').insert({
      restaurant_id: restaurantId,
      name_ko: nameKo,
      name_en: nameEn,
    })
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
      <h3 className="font-medium text-gray-800 text-sm">카테고리 추가</h3>
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text" value={nameKo} onChange={e => setNameKo(e.target.value)}
          required placeholder="카테고리 (한국어)"
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <input
          type="text" value={nameEn} onChange={e => setNameEn(e.target.value)}
          placeholder="Category (English)"
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={loading}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50">
          {loading ? '추가 중...' : '추가'}
        </button>
        <button type="button" onClick={onCancel}
          className="border px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          취소
        </button>
      </div>
    </form>
  )
}

function AddMenuItemForm({ restaurantId, categories, onDone, onCancel }: {
  restaurantId: string; categories: MenuCategoryWithItems[]; onDone: () => void; onCancel: () => void
}) {
  const [nameKo, setNameKo] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [descKo, setDescKo] = useState('')
  const [descEn, setDescEn] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase.from('menu_items').insert({
      restaurant_id: restaurantId,
      category_id: categoryId || null,
      name_ko: nameKo,
      name_en: nameEn,
      description_ko: descKo,
      description_en: descEn,
      price: parseInt(price),
    })
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3">
      <h3 className="font-medium text-gray-800 text-sm">메뉴 추가</h3>
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text" value={nameKo} onChange={e => setNameKo(e.target.value)}
          required placeholder="메뉴명 (한국어)"
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <input
          type="text" value={nameEn} onChange={e => setNameEn(e.target.value)}
          placeholder="Menu name (English)"
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <input
          type="text" value={descKo} onChange={e => setDescKo(e.target.value)}
          placeholder="설명 (한국어, 선택)"
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <input
          type="text" value={descEn} onChange={e => setDescEn(e.target.value)}
          placeholder="Description (English, optional)"
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <input
          type="number" value={price} onChange={e => setPrice(e.target.value)}
          required placeholder="가격 (원)" min="0"
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <select
          value={categoryId} onChange={e => setCategoryId(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
        >
          <option value="">카테고리 선택 (선택)</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name_ko}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={loading}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50">
          {loading ? '추가 중...' : '메뉴 추가'}
        </button>
        <button type="button" onClick={onCancel}
          className="border px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          취소
        </button>
      </div>
    </form>
  )
}
