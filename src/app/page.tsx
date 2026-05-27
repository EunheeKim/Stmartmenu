import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <span className="text-xl font-bold text-orange-500">SmartMenu</span>
        <Link
          href="/auth"
          className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          식당 등록하기
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          외국인 손님도<br />
          <span className="text-orange-500">막힘 없이 주문</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
          QR 코드 하나로 외국어 메뉴 + 주문까지.
          직원이 Papago 켤 필요 없어요.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
          <Link
            href="/auth"
            className="bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors text-lg"
          >
            무료로 시작하기
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="text-3xl mb-3">📋</div>
            <h3 className="font-semibold text-gray-900 mb-2">메뉴 10분 등록</h3>
            <p className="text-gray-600 text-sm">한국어 메뉴만 입력하면 영어로 자동 변환됩니다.</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="font-semibold text-gray-900 mb-2">QR로 즉시 주문</h3>
            <p className="text-gray-600 text-sm">외국인이 QR 스캔 → 영어 메뉴 확인 → 주문 완료. 앱 설치 불필요.</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="text-3xl mb-3">🔔</div>
            <h3 className="font-semibold text-gray-900 mb-2">이메일로 주문 알림</h3>
            <p className="text-gray-600 text-sm">주문 들어오면 이메일로 바로 알림. 한국어로 정리돼서 옵니다.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
