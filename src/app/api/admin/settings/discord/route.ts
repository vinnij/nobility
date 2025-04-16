import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions/permissions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions())
        if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'settings', action: 'manage' })))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const discordIntegration = await prisma.discordIntegration.findFirst()

        if (!discordIntegration) {
            return NextResponse.json({ error: "Discord integration settings not found" }, { status: 204 })
        }

        return NextResponse.json(discordIntegration, { status: 200 })
    } catch (error) {
        console.error('Error fetching Discord integration settings:', error)
        return NextResponse.json({ error: 'Failed to fetch Discord integration settings' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions())
        if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'settings', action: 'manage' })))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const data = await request.json();

        await prisma.discordIntegration.update({
            where: { id: 1 },
            data: {
                guildId: data.guildId,
                webhookUrl: data.webhookUrl,
                verificationHookColor: data.verificationHookColor,
                verificationHookEnabled: data.verificationHookEnabled,
                ticketHookUrl: data.ticketHookUrl,
                ticketHookColor: data.ticketHookColor,
                ticketHookEnabled: data.ticketHookEnabled,
            },
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error updating Discord integration settings:', error);
        return NextResponse.json({ error: 'Failed to update Discord integration settings' }, { status: 500 });
    }
}
