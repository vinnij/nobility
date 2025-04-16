import { prisma } from '@/lib/db'

export async function getRedirects() {
    try {
        const redirects = await prisma.redirect.findMany({
            select: {
                source: true,
                destination: true,
                permanent: true
            }
        });

        return redirects.map(redirect => ({
            source: redirect.source,
            destination: redirect.destination,
            permanent: redirect.permanent
        }));
    } catch (error) {
        console.error('Error fetching redirects:', error);
        return [];
    }
} 