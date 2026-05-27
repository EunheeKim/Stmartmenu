import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import type { OrderItem } from '@/lib/types'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { restaurant_id, table_number, items, total_price, tourist_language, special_requests } = body

    if (!restaurant_id || !items?.length || !total_price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()

    // 주문 저장
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        restaurant_id,
        table_number: table_number || null,
        items,
        total_price,
        tourist_language: tourist_language || 'en',
        special_requests: special_requests || '',
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Order insert error:', error)
      return NextResponse.json({ error: 'Failed to save order' }, { status: 500 })
    }

    // 식당 정보 조회 (알림 이메일용)
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('name, notification_email, email')
      .eq('id', restaurant_id)
      .single()

    const notifyEmail = restaurant?.notification_email || restaurant?.email
    if (notifyEmail && process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your_resend_api_key') {
      const itemLines = (items as OrderItem[])
        .map(i => `• ${i.name_ko} (${i.name_en}) × ${i.quantity} — ₩${(i.price * i.quantity).toLocaleString()}`)
        .join('\n')

      await resend.emails.send({
        from: 'SmartMenu <noreply@smartmenu.app>',
        to: notifyEmail,
        subject: `[SmartMenu] 새 주문 — ₩${total_price.toLocaleString()}${table_number ? ` (테이블 ${table_number})` : ''}`,
        text: [
          `[${restaurant?.name}] 새 주문이 들어왔습니다.`,
          '',
          table_number ? `테이블: ${table_number}` : '',
          '',
          '주문 내역:',
          itemLines,
          '',
          `합계: ₩${total_price.toLocaleString()}`,
          special_requests ? `\n특이사항: ${special_requests}` : '',
          '',
          `주문 ID: ${order.id}`,
        ].filter(l => l !== undefined).join('\n'),
      }).catch(err => console.error('Email send error:', err))
    }

    return NextResponse.json({ orderId: order.id }, { status: 201 })
  } catch (err) {
    console.error('Order API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
