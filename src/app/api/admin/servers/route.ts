import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions/permissions';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions())
        if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'servers', action: 'manage' })))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const data = await request.json();
        const newServer = await prisma.servers.create({
            data: {
                server_id: data.id,
                server_name: data.name,
                order: data.order,
                image_path: data.image_path,
                server_address: data.server_address,
                category: {
                    connect: {
                        id: data.categoryId
                    }
                }
            }
        });
        revalidatePath("/", "layout")
        revalidatePath("/api/servers", "layout")
        return NextResponse.json({ success: true, server: newServer });
    } catch (error) {
        console.error('Error adding server:', error);
        return NextResponse.json({ success: false, error: 'Failed to add server' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions())
        if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'servers', action: 'manage' })))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const { oldServerId, serverId, name, imagePath, serverAddress, enabled } = await request.json();
        const updatedServer = await prisma.servers.update({
            where: { server_id: oldServerId },
            data: {
                server_id: serverId,
                enabled: enabled,
                server_name: name,
                image_path: imagePath,
                server_address: serverAddress,
            },
        });
        revalidatePath("/", "layout")
        revalidatePath("/api/servers", "layout")
        return NextResponse.json({ success: true, server: updatedServer });
    } catch (error) {
        console.error('Error updating server:', error);
        return NextResponse.json({ success: false, error: 'Failed to update server' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions())
        if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'servers', action: 'manage' })))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ success: false, error: 'Server ID is required' }, { status: 400 });
        }
        await prisma.servers.delete({
            where: {
                server_id: id
            }
        });
        revalidatePath("/", "layout")
        revalidatePath("/api/servers", "layout")
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting server:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete server' }, { status: 500 });
    }
}
