import { NextResponse } from 'next/server';
import { generateSitemap } from '@/lib/sitemap';

export async function GET() {
    try {
        const sitemap = await generateSitemap();
        // Check if the sitemap is empty or invalid
        if (!sitemap || sitemap.trim() === '') {
            return new NextResponse('Sitemap is empty', { status: 404 });
        }
        return new NextResponse(sitemap, {
            headers: {
                'Content-Type': 'application/xml',
            },
        });
    } catch (error) {
        return new NextResponse('Error generating sitemap', { status: 500 });
    }
}