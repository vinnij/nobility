import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions())
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json();
    const { vote_id, map_option_id } = body;

    if (!vote_id || !map_option_id) {
        return NextResponse.json({ error: "Missing vote_id or map_option_id" }, { status: 400 })
    }

    const vote = await prisma.mapVote.findUnique({
        where: { id: vote_id },
        include: {
            map_options: true
        }
    });

    if (!vote) {
        return NextResponse.json({ error: "Vote not found" }, { status: 204 })
    }

    const voteOption = vote.map_options.find((option) => option.id === map_option_id);

    if (!voteOption) {
        return NextResponse.json({ error: "Map option not found" }, { status: 204 })
    }

    const userVote = await prisma.userVote.findFirst({
        where: {
            vote_id: vote_id,
            user_id: session.user.id
        }
    });

    if (userVote) {
        return NextResponse.json({ error: "You have already voted for this map" }, { status: 400 })
    }

    await prisma.userVote.create({
        data: {
            vote_id: vote_id,
            vote_option_id: map_option_id,
            user_id: session.user.id
        }
    });

    return NextResponse.json({ message: "Your vote has been recorded" }, { status: 200 });
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions())
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userVotes = await prisma.userVote.findMany({
        where: { user_id: session.user.id },
    })

    return NextResponse.json(userVotes, { status: 200 });
}