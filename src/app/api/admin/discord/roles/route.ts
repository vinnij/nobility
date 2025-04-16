import { NextResponse } from 'next/server';
import { protectedRoute } from '@/lib/api-auth';
import { cache } from 'react';


/// GET: Get all discord guilds
async function handleGet(request: Request) {
    try {

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('guildId');

        if (!id) {
            return NextResponse.json({ error: 'Missing guild ID' }, { status: 400 });
        }

        const data = await fetch(`https://discordapp.com/api/v9/guilds/${id}/roles`, {
            method: 'GET',
            headers: {
                'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN!}`,
                'Content-Type': 'application/json'
            }
        });

        const roles = await data.json();

        if (roles.message && roles.code === 0) {
            return NextResponse.json({ error: `Discord API Error: ${roles.message}` }, { status: 400 });
        }

        return NextResponse.json({
            guildId: id,
            roles: roles.filter((role: any) => role.name !== '@everyone')
                .map((role: any) => ({ id: role.id, name: role.name }))
        });
    } catch (error) {
        console.error('Error getting discord guilds:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const GET = cache(protectedRoute(handleGet));