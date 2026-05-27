import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from './LogoutButton'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-lg font-bold text-orange-500">SmartMenu</span>
          <div className="flex gap-4 text-sm">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">홈</Link>
            <Link href="/dashboard/menu" className="text-gray-600 hover:text-gray-900">메뉴 관리</Link>
            <Link href="/dashboard/orders" className="text-gray-600 hover:text-gray-900">주문 현황</Link>
            <Link href="/dashboard/qr" className="text-gray-600 hover:text-gray-900">QR 코드</Link>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>{user.email}</span>
          <LogoutButton />
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
