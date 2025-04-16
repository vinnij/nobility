import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { protectedRoute } from '@/lib/api-auth';

export const GET = protectedRoute(async (request: Request, { params }: { params: { id: string } }) => {
    try {
        const role = await prisma.role.findFirst({
            where: {
                OR: [
                    { id: params.id },
                    { discordRoleId: params.id },
                    { oxideGroupName: params.id },
                ],
            },
        });

        if (!role) {
            return NextResponse.json({ error: 'Role not found' }, { status: 204 });
        }

        return NextResponse.json({
            role: {
                id: role.id,
                name: role.name,
                serverId: role.serverId,
                oxideGroupName: role.oxideGroupName,
                discordRoleId: role.discordRoleId,
                discordGuildId: role.discordGuildId,
                assignOnVerification: role.assignOnVerification,
                assignOnBoost: role.assignOnBoost,
                assignOnGroupJoin: role.assignOnGroupJoin,
            }
        });
    } catch (error) {
        console.error('Error fetching role:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});

export const PUT = protectedRoute(async (request: Request, { params }: { params: { id: string } }) => {
    try {
        const data = await request.json();
        const role = await prisma.role.findFirst({
            where: {
                OR: [
                    { id: params.id },
                    { discordRoleId: params.id },
                    { oxideGroupName: params.id },
                ],
            },
        });

        if (!role) {
            return NextResponse.json({ message: 'Role not found' });
        }
        const updatedRole = await prisma.role.update({
            where: { id: role.id },
            data: {
                name: data.name ?? role.name,
                serverId: data.serverId ? data.serverId : null,
                color: data.color ?? role.color,
                oxideGroupName: data.oxideGroupName ? data.oxideGroupName : null,
                discordRoleId: data.discordRoleId ? data.discordRoleId : null,
                discordGuildId: data.discordGuildId ? data.discordGuildId : null,
                assignOnVerification: data.assignOnVerification ?? role.assignOnVerification,
                assignOnBoost: data.assignOnBoost ?? role.assignOnBoost,
                assignOnGroupJoin: data.assignOnGroupJoin ?? role.assignOnGroupJoin,
            },
        });

        return NextResponse.json({
            role: {
                id: updatedRole.id,
                name: updatedRole.name,
                serverId: updatedRole.serverId,
                color: updatedRole.color,
                oxideGroupName: updatedRole.oxideGroupName,
                discordRoleId: updatedRole.discordRoleId,
                discordGuildId: updatedRole.discordGuildId,
                assignOnVerification: updatedRole.assignOnVerification,
                assignOnBoost: updatedRole.assignOnBoost,
                assignOnGroupJoin: updatedRole.assignOnGroupJoin,
            }
        });
    } catch (error) {
        console.error('Error updating role:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});

export const DELETE = protectedRoute(async (request: Request, { params }: { params: { id: string } }) => {
    try {
        const role = await prisma.role.findFirst({
            where: {
                OR: [
                    { id: params.id },
                    { discordRoleId: params.id },
                    { oxideGroupName: params.id },
                ],
            },
        });

        if (!role) {
            return NextResponse.json({ error: 'Role not found' }, { status: 204 });
        }

        await prisma.role.delete({
            where: { id: role.id },
        });

        return NextResponse.json({ message: 'Role deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting role:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});