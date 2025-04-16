import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { hasPermission } from '@/lib/permissions/permissions';
import { getServerSession } from 'next-auth/next';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const session = await getServerSession(authOptions())
        if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'seo', action: 'manage' })))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const siteMetadata = await prisma.siteMetadata.findFirst();
        
        if (!siteMetadata) {
            return NextResponse.json({ error: 'Site metadata not found' }, { status: 404 });
        }

        return NextResponse.json(siteMetadata);
    } catch (error) {
        console.error('Error fetching site metadata:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions())
        if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'seo', action: 'manage' })))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const data = await request.json();

        const updatedMetadata = await prisma.siteMetadata.upsert({
            where: { id: 1 },
            update: data,
            create: { ...data, id: 1 },
        });

        revalidatePath("/", "layout")
        revalidatePath("/api/admin/settings/metadata", "layout")

        return NextResponse.json(updatedMetadata);
    } catch (error) {
        console.error('Error updating site metadata:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
