enum Game {
    rust
}

enum Platform {
    steam, minecraft, minecraft_offline
}

enum SubscriptionIntervalScale {
    day, week, month, year
}

enum DiscountType {
    percent, amount
}

export type Store = {
    id: string
    slug: string
    name: string
    game: Game
    currency: string
    logo_url: string | null
    logo_square_url: string | null
}

export type Tag = {
    id: number
    slug: string
    name: string
    description: string | null
}

export type NavLink = {
    node_id: string
    name: string
    tag_id: string
    tag_query: string[]
    tag_slug: string
    order: number
    parent_node_id: string | null
    store_id: string
    children: NavLink[]
}

export type Product = {
    id: string
    store_id: string
    slug: string
    image_url: string | null
    name: string
    description: string
    enabled_at: string | null
    enabled_until: string | null
    sort_order: number
    price: number
    allow_one_time_purchase: boolean
    allow_subscription: boolean
    subscription_interval_value: number
    subscription_interval_scale: SubscriptionIntervalScale
    stock: StockLimit
    pricing: Pricing
    tags: Tag[]
    created_at: string
    updated_at: string | null
}

export type Customer = {
    id: string
    store_id: string
    profile: GenericProfile | null
    steam_id: string | null
    /* minecraft_uuid: string | null */
    steam: SteamProfile
    name: string | null
    created_at: string
    updated_at: string
}

export interface InventoryItem {
    id: string;
    store_id: string;
    customer: Customer;
    order_customer: Customer;
    order_id: string;
    order_line_id: string;
    quantity_index: number;
    product: {
        id: string;
        store_id: string;
        version_id: string;
        slug: string;
        name: string;
    };
    state: 'used' | 'active' | 'expired' | 'revoked';
    expirable: boolean;
    gift: boolean;
    added_at: string;
    added_by: string | null;
    active_at: string | null;
    expires_at: string | null;
    removed_at: string | null;
    revoked_at: string | null;
    revoke_reason: string | null;
    revoked_by: string | null;
}

export type Subscription = {
    id: string
    pretty_id: string
    store_id: string
    customer: Customer
    status: string
    checkout_id: string
    checkout_line_id: string
    billing_name: string | null
    billing_email: string | null
    billing_country: string | null
    gift: boolean
    gift_to_customer: Customer | null
    product_id: string
    product_name: string
    product_image_url: string | null
    interval_value: number
    interval_scale: string
    currency: string
    tax_inclusive: boolean
    price: number
    discount_amount: number
    subtotal_amount: number
    tax_amount: number
    total_amount: number
    total_amount_str: string
    created_at: string
    updated_at: string | null
    active_at: string | null
    canceled_at: string | null
    cancel_reason: string | null
}

export type Cart = {
    store_id: string
    customer_id: string
    total: number
    lines: CartLine[]
}

type CartLine = {
    product_id: string
    name: string
    slug: string
    price: number
    quantity: number
    selected_gameserver: string | null
    selected_gameserver_id: string | null
}

export type CheckoutRequestLineObject = {
    product_id: string
    gift_to?: CustomerPlatformAccount
    gift_to_customer_id?: string
    quantity: number
}

export type Order = {
    id: string
    pretty_id: string
    store_id: string
    customer: Customer
    status: "created" | "completed" | "canceled" | "refunded" | "chargeback",
    checkout_id: string | null
    subscription_id: string | null
    is_subscription: boolean
    coupon_id: string | null
    giftcard_id: string | null
    billing_name: string | null
    billing_email: string | null
    billing_country: string | null
    customer_ip: string | null
    currency: string
    tax_inclusive: boolean
    discount_amount: number
    discount_amount_str: string
    subtotal_amount: number
    subtotal_amount_str: string
    tax_amount: number
    tax_amount_str: string
    giftcard_usage_amount: number
    giftcard_usage_amount_str: string
    total_amount: number
    total_amount_str: string
    billing_cycle_sequence: number | null
    lines: OrderLine[]
    created_at: string
    completed_at: string | null
    canceled_at: string | null
}

export type OrderLine = {
    id: string
    checkout_line_id: string
    product_id: string
    product_version_id: string
    product_name: string
    product_image_url: string | null
    subscription_interval_value: number
    subscription_interval_scale: "day" | "week" | "month" | "year"
    gift: boolean
    gift_to_customer: Customer | null
    selected_gameserver_id: string | null
    price: number
    price_str: string
    quantity: number
    discount_amount: number
    discount_amount_str: string
    subtotal_amount: number
    subtotal_amount_str: string
    total_amount: number
    total_amount_str: string
}

type CustomerPlatformAccount = {
    platform: "steam"
    id: string
}

type SteamProfile = {
    id: string
    name: string | null
    avatar_url: string | null
}

type GenericProfile = {
    id: string
    platform: Platform
    name: string | null
    avatar_url: string | null
}

type StockLimit = {
    available_to_purchase: boolean
    customer_available: number | null
}

type Pricing = {
    active_sale: ActiveSale
    sale_value: number | null
    vat_rate: VatRate | null
    price_original: number
    price_final: number
}

type ActiveSale = {
    id: string
    name: string
    discount_type: DiscountType
    discount_amount: number
    minimum_order_value: number
    begins_at: string
    ends_at: string | null
}

type VatRate = {
    country_code: string
    country_name: string
    currency: string
    vat_abbreviation: string
    vat_local_name: string
    eu_member_state: boolean
    percentage: number
}