import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import QRDownload from './QRDownload'

export default async function QRPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!restaurant) redirect('/dashboard')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const menuUrl = `${appUrl}/m/${restaurant.slug}`

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">QR 코드</h1>

      <div className="bg-white border rounded-2xl p-6 text-center space-y-4">
        {/* QR 미리보기 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/qr?slug=${restaurant.slug}`}
          alt="QR Code"
          className="w-48 h-48 mx-auto"
        />
        <p className="text-sm text-gray-500 break-all">{menuUrl}</p>
        <QRDownload slug={restaurant.slug} restaurantName={restaurant.name} />
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <strong>사용 방법:</strong> QR 코드를 다운로드해서 각 테이블에 부착하세요.
        외국인 손님이 스캔하면 영어 메뉴와 주문이 가능합니다.
      </div>
    </div>
  )
}
