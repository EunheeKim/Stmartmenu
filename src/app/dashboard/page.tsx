import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  const { count: menuCount } = await supabase
    .from('menu_items')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurant?.id ?? '')

  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurant?.id ?? '')
    .eq('status', 'pending')

  if (!restaurant) {
    return <RestaurantSetup userId={user.id} email={user.email!} />
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
      <p className="text-gray-500 text-sm mb-8">
        메뉴 URL:{' '}
        <a
          href={`${appUrl}/m/${restaurant.slug}`}
          target="_blank"
          className="text-orange-500 hover:underline"
        >
          {appUrl}/m/{restaurant.slug}
        </a>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="등록된 메뉴" value={menuCount ?? 0} unit="개" href="/dashboard/menu" />
        <StatCard label="대기 중인 주문" value={orderCount ?? 0} unit="건" href="/dashboard/orders" highlight={!!orderCount} />
        <StatCard label="QR 코드" value="다운로드" href="/dashboard/qr" isLink />
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800">
        <strong>시작 가이드:</strong>{' '}
        1) <Link href="/dashboard/menu" className="underline">메뉴 등록</Link> →
        2) <Link href="/dashboard/qr" className="underline">QR 코드 다운로드</Link> →
        3) 테이블에 QR 부착 완료!
      </div>
    </div>
  )
}

function StatCard({
  label, value, unit, href, highlight, isLink
}: {
  label: string; value: number | string; unit?: string; href: string; highlight?: boolean; isLink?: boolean
}) {
  return (
    <Link
      href={href}
      className={`rounded-xl border p-5 hover:shadow-sm transition-shadow ${highlight ? 'bg-orange-50 border-orange-200' : 'bg-white'}`}
    >
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">
        {isLink ? <span className="text-lg text-orange-500">{value}</span> : value}
        {unit && <span className="text-base font-normal text-gray-500 ml-1">{unit}</span>}
      </p>
    </Link>
  )
}

function RestaurantSetup({ userId, email }: { userId: string; email: string }) {
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">식당 등록</h1>
      <p className="text-gray-500 mb-6">먼저 식당 정보를 입력해주세요.</p>
      <RestaurantForm userId={userId} email={email} />
    </div>
  )
}

import RestaurantForm from './RestaurantForm'
