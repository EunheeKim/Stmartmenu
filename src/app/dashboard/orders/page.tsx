import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OrdersList from './OrdersList'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!restaurant) redirect('/dashboard')

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">주문 현황</h1>
      <OrdersList orders={orders ?? []} restaurantId={restaurant.id} />
    </div>
  )
}
