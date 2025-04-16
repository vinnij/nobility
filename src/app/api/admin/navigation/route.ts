import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { hasPermission } from '@/lib/permissions/permissions';

const navigationItemSchema = z.object({
    label: z.string().min(1),
    url: z.string(),
    order: z.number().int().min(0),
});

export async function GET() {
    const navigationItems = await prisma.navigationItem.findMany({
        orderBy: { order: 'asc' },
    });

    return NextResponse.json(navigationItems);
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions())
    if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'settings', action: 'manage' })))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json();
    const validatedData = navigationItemSchema.parse(body);

    const newItem = await prisma.navigationItem.create({
        data: validatedData,
    });

    return NextResponse.json(newItem, { status: 201 });
}

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions())
    if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'settings', action: 'manage' })))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json();
    const { id, ...data } = navigationItemSchema.extend({ id: z.string() }).parse(body);

    const updatedItem = await prisma.navigationItem.update({
        where: { id },
        data,
    });

    return NextResponse.json(updatedItem);
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions())
    if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'settings', action: 'manage' })))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await request.json();
    if (!id) {
        return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await prisma.navigationItem.delete({
        where: { id },
    });

    return NextResponse.json({ success: true });
}

