import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { hasPermission } from '@/lib/permissions/permissions';
import { revalidateTag } from 'next/cache'

export async function GET() {
    const session = await getServerSession(authOptions())
    if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'settings', action: 'manage' })))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const redirects = await prisma.redirect.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(redirects);
}

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions())
    if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'settings', action: 'manage' })))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json();
    
    try {
        const redirect = await prisma.redirect.upsert({
            where: {
                source: data.source
            },
            update: {
                destination: data.destination,
                permanent: data.permanent
            },
            create: {
                source: data.source,
                destination: data.destination,
                permanent: data.permanent
            }
        });

        // Revalidate the cache after updating
        revalidateTag('redirects')

        return NextResponse.json(redirect);
    } catch (error) {
        console.error('Error upserting redirect:', error);
        return NextResponse.json(
            { error: 'Failed to create/update redirect' }, 
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions())
    if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'settings', action: 'manage' })))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.redirect.delete({
        where: { id: parseInt(id) }
    });

    // Revalidate the cache after deleting
    revalidateTag('redirects')

    return NextResponse.json({ success: true });
} 