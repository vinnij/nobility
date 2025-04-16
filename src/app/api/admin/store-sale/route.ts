import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions/permissions';
import { prisma } from "@/lib/db";


export async function GET() {
    try {
        const storeSale = await prisma.storeSale.findUnique({
            where: { id: 1 },
        });

        return NextResponse.json(storeSale);
    } catch (error) {
        console.error('Error fetching store sale:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions())
    if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: "settings", action: "manage" })))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { enabled, title, description, url } = await request.json();

        const updatedStoreSale = await prisma.storeSale.upsert({
            where: { id: 1 },
            update: { enabled, title, description, url },
            create: { id: 1, enabled, title, description, url },
        });

        return NextResponse.json(updatedStoreSale);
    } catch (error) {
        console.error('Error updating store sale:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

