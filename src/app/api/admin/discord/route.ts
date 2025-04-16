import { prisma } from "@/lib/db";
import { NextResponse } from 'next/server';
import { protectedRoute } from '@/lib/api-auth';


/// GET: Get all discord guilds
async function handleGet(request: Request) {
    try {
        const guilds = await prisma.discord_guild.findMany({});
        return NextResponse.json(!!guilds ? guilds : []);
    } catch (error) {
        console.error('Error getting discord guilds:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Create a new discord guild
async function handlePost(request: Request) {
    try {
        const { id, name } = await request.json();

        if (!id || !name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await prisma.discord_guild.upsert({
            where: { id },
            update: { name },
            create: { id, name },
        });

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        console.error('Error creating discord guild:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
// DELETE: Remove a discord guild
async function handleDelete(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing guild ID' }, { status: 400 });
        }

        await prisma.discord_guild.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Discord guild deleted successfully' });
    } catch (error) {
        console.error('Error deleting discord guild:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const GET = protectedRoute(handleGet);
export const POST = protectedRoute(handlePost);
export const DELETE = protectedRoute(handleDelete);