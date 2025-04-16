import { User } from "next-auth"

export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'enum' | 'textarea' | 'players' | 'server' | 'server-grid' | 'players-grid'

export interface FieldOptions {
    defaultValue?: string | number | boolean
    description?: string
    placeholder?: string
    minLength?: number
    maxLength?: number
    minValue?: number
    maxValue?: number
    minDate?: string
    maxDate?: string
    enumOptions?: string[]
}

export interface TicketField {
    id?: string
    label: string
    key: string
    type: FieldType
    required: boolean
    order: number
    options?: FieldOptions
}

export interface TicketStep {
    id?: string
    name: string
    order: number
    fields: TicketField[]
}

export interface TicketCategory {
    slug?: string
    name: string
    steps: TicketStep[]
}

export interface CategoryWithId extends TicketCategory {
    slug: string
}

export interface FormValues {
    name: string
    steps: TicketStep[]
}



export interface Ticket {
    id: number
    categoryId: string
    category: TicketCategory
    status: 'open' | 'closed'
    user: User & { storeId: string, createdAt: Date }
    userId: string
    content: any
    messages: TicketMessage[]
    createdAt: Date
    updatedAt: Date
}

export interface TicketMessage {
    id: number
    ticketId: number
    ticket: Ticket
    content: string
    user: User
    userId: string
    createdAt: Date
    attachments: string
}

export interface Player {
    steam_id: string
    username: string
    userId?: string
    user?: {
        image?: string
    }
}