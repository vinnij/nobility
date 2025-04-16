import { NavigationItem } from '@/types/navigation'

export async function getNavigationItems(): Promise<NavigationItem[]> {
    const response = await fetch('/api/admin/navigation')
    if (!response.ok) throw new Error('Failed to fetch navigation items')
    return response.json()
}

export async function createNavigationItem(item: Omit<NavigationItem, 'id'>): Promise<NavigationItem> {
    const response = await fetch('/api/admin/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
    })
    if (!response.ok) throw new Error('Failed to create navigation item')
    return response.json()
}

export async function deleteNavigationItem(id: string): Promise<void> {
    const response = await fetch('/api/admin/navigation', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
    })
    if (!response.ok) throw new Error('Failed to delete navigation item')
}

export async function updateNavigationItem(data: NavigationItem): Promise<NavigationItem> {
    const response = await fetch('/api/admin/navigation', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        throw new Error('Failed to update navigation item')
    }

    return response.json()
}
