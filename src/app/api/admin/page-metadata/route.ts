import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { hasPermission } from '@/lib/permissions/permissions';
import { getServerSession } from 'next-auth/next';
import { revalidatePath } from 'next/dist/server/web/spec-extension/revalidate';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const session = await getServerSession(authOptions())
        if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'seo', action: 'manage' })))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const pages = await prisma.pageMetadata.findMany({
            select: { slug: true },
            orderBy: { slug: 'asc' },
        });
        return NextResponse.json(pages);
    } catch (error) {
        console.error('Error fetching page metadata:', error);
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
        const newPage = await prisma.pageMetadata.create({ data });
        revalidatePath("/", "layout")
        revalidatePath("/api/admin/page-metadata", "layout")
        revalidatePath(newPage.slug, "page")
        return NextResponse.json(newPage, { status: 201 });
    } catch (error) {
        console.error('Error creating page metadata:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}