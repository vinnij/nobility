import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { protectedRoute } from '@/lib/api-auth';

export const GET = protectedRoute(async (request: Request, { params }: { params: { id: string } }) => {
    try {

        const url = new URL(request.url);
        const serverId = url.searchParams.get('serverId') ?? undefined;
        const discordId = url.searchParams.get('discordId') ?? undefined;

        const where: any = {};
        let select: any = {
            id: true,
            name: true,
            discordRoleId: true,
            discordGuildId: true,
            serverId: true,
            oxideGroupName: true,
            assignOnBoost: true,
            assignOnVerification: true,
            assignOnGroupJoin: true,
        };
        if (serverId) {
            where.OR = [
                { serverId: serverId },
                { serverId: "global" }
            ]
            select = { oxideGroupName: true }
        }

        if (discordId) {
            where.OR = [
                { discordGuildId: discordId },
                { discordGuildId: "global" }
            ]
            select = { name: true, discordRoleId: true }
        }

        const roles = await prisma.role.findMany({
            where: where,
            select: select
        });

        if (!roles || roles.length === 0) {
            return NextResponse.json({ roles: [] });
        }

        let mappedRoles;
        if (serverId) {
            mappedRoles = roles.filter((r) => !!r.oxideGroupName).map((r) => r.oxideGroupName);
        } else if (discordId) {
            mappedRoles = roles.filter((r) => !!r.discordRoleId).map((r) => r.discordRoleId);
        } else {
            mappedRoles = roles;
        }

        return NextResponse.json({ roles: mappedRoles });
    } catch (error) {
        console.error('Error fetching role:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});