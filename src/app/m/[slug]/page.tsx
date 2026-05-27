import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import MenuPageClient from './MenuPageClient'

export default async function PublicMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!restaurant) notFound()

  const { data: categories } = await supabase
    .from('menu_categories')
    .select('*, menu_items(*)')
    .eq('restaurant_id', restaurant.id)
    .order('sort_order')

  const { data: uncategorized } = await supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .eq('is_available', true)
    .is('category_id', null)
    .order('sort_order')

  // is_available 필터 적용한 카테고리 아이템
  const filteredCategories = (categories ?? []).map(cat => ({
    ...cat,
    menu_items: (cat.menu_items ?? []).filter((item: { is_available: boolean }) => item.is_available),
  }))

  return (
    <MenuPageClient
      restaurant={restaurant}
      categories={filteredCategories}
      uncategorized={uncategorized ?? []}
    />
  )
}
