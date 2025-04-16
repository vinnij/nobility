import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { hasPermission } from '@/lib/permissions/permissions';
import { getServerSession } from 'next-auth/next';
import { revalidatePath } from 'next/dist/server/web/spec-extension/revalidate';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const session = await getServerSession(authOptions())
        if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'seo', action: 'manage' })))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const page = await prisma.pageMetadata.findUnique({
            where: { slug: params.slug },
        });
        if (!page) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }
        return NextResponse.json(page);
    } catch (error) {
        console.error('Error fetching page metadata:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const session = await getServerSession(authOptions())
        if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'seo', action: 'manage' })))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const data = await request.json();
        const updatedPage = await prisma.pageMetadata.update({
            where: { slug: params.slug },
            data,
        });
        revalidatePath("/", "layout")
        revalidatePath("/api/admin/page-metadata", "layout")
        revalidatePath(`/api/admin/page-metadata/${params.slug}`, "layout")
        revalidatePath(params.slug, "page")
        return NextResponse.json(updatedPage);
    } catch (error) {
        console.error('Error updating page metadata:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const session = await getServerSession(authOptions())
        if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'seo', action: 'manage' })))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        await prisma.pageMetadata.delete({
            where: { slug: params.slug },
        });
        revalidatePath("/", "layout")
        revalidatePath(`/${params.slug}`, "layout")
        revalidatePath("/api/admin/page-metadata", "layout")
        revalidatePath(`/api/admin/page-metadata/${params.slug}`, "layout")
        revalidatePath(params.slug, "page")
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting page metadata:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}