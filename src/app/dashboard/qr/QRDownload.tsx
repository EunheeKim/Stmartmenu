'use client'

export default function QRDownload({ slug, restaurantName }: { slug: string; restaurantName: string }) {
  function handleDownload() {
    const a = document.createElement('a')
    a.href = `/api/qr?slug=${slug}`
    a.download = `smartmenu-qr-${slug}.png`
    a.click()
  }

  return (
    <button
      onClick={handleDownload}
      className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
    >
      QR 코드 PNG 다운로드
    </button>
  )
}
