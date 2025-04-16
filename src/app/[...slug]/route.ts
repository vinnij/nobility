import { NextRequest, NextResponse } from 'next/server'
import { notFound } from 'next/navigation'

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string[] } }
) {
    const pathname = `/${params.slug.join('/')}`

        const response = await fetch(`${request.nextUrl.origin}/api/redirects`)
        if (!response.ok) throw new Error('Failed to fetch redirects')
        
        const redirects = await response.json()
        const redirect = redirects.find((r: { source: string }) => r.source === pathname)

        if (redirect) {
            return NextResponse.redirect(new URL(redirect.destination, request.url), {
                status: redirect.permanent ? 308 : 307
            })
        }

        // Instead of throwing notFound(), redirect to a 404 page
        if (!redirect) {
            return NextResponse.redirect(new URL('/404', request.url))
        }
} 