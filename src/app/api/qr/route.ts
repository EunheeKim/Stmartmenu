import { NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const menuUrl = `${appUrl}/m/${slug}`

  const pngBuffer = await QRCode.toBuffer(menuUrl, {
    type: 'png',
    width: 400,
    margin: 2,
    color: { dark: '#1f2937', light: '#ffffff' },
  })

  return new NextResponse(pngBuffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="smartmenu-qr-${slug}.png"`,
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
