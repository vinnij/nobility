import { getRedirects } from '@/lib/get-redirects'
import { NextResponse } from 'next/server'

// Cache time in seconds (e.g., 300 = 5 minutes)
const CACHE_TIME = 300

export async function GET() {
    try {
        const redirects = await getRedirects()
        return NextResponse.json(redirects, {
            headers: {
                'Cache-Control': `s-maxage=${CACHE_TIME}, stale-while-revalidate`,
            },
        })
    } catch (error) {
        console.error('Error fetching redirects:', error)
        return NextResponse.json([])
    }
} 