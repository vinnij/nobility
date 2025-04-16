import { protectedRoute } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

async function handleGet(request: Request) {
    const count = await prisma.account.count({
        where: {
            provider: 'discord'
        }
    });
    return NextResponse.json({ count: count || 0 });
}

export const GET = protectedRoute(handleGet)