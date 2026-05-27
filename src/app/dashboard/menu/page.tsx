import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MenuManager from './MenuManager'

export default async function MenuPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!restaurant) redirect('/dashboard')

  const { data: categories } = await supabase
    .from('menu_categories')
    .select('*, menu_items(*)')
    .eq('restaurant_id', restaurant.id)
    .order('sort_order')

  const { data: uncategorized } = await supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .is('category_id', null)
    .order('sort_order')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">메뉴 관리</h1>
      </div>
      <MenuManager
        restaurantId={restaurant.id}
        categories={categories ?? []}
        uncategorized={uncategorized ?? []}
      />
    </div>
  )
}
