export interface Restaurant {
  id: string
  owner_id: string
  name: string
  name_en: string | null
  slug: string
  description_ko: string | null
  description_en: string | null
  email: string
  phone: string | null
  address: string | null
  notification_email: string | null
  created_at: string
}

export interface MenuCategory {
  id: string
  restaurant_id: string
  name_ko: string
  name_en: string
  sort_order: number
}

export interface MenuItem {
  id: string
  restaurant_id: string
  category_id: string | null
  name_ko: string
  name_en: string
  description_ko: string
  description_en: string
  price: number
  image_url: string | null
  is_available: boolean
  sort_order: number
  created_at: string
}

export interface OrderItem {
  id: string
  name_ko: string
  name_en: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  restaurant_id: string
  table_number: string | null
  items: OrderItem[]
  total_price: number
  status: 'pending' | 'confirmed' | 'ready' | 'completed'
  tourist_language: string
  special_requests: string
  created_at: string
}

export interface MenuCategoryWithItems extends MenuCategory {
  menu_items: MenuItem[]
}
