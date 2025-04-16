import { openDMChannel, sendMessage } from "@/app/actions/discord";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions())
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const discordId = session.user.discordId;
        if (!discordId) {
            return NextResponse.json({ error: "Discord ID not found" }, { status: 400 })
        }
        const channelId = await openDMChannel(discordId);
        if (!channelId) {
            return NextResponse.json({ error: "Failed to open DM channel" }, { status: 400 })
        }
        const message = "Hello, world!";
        const embeds = [{
            title: "Hello, world!",
            description: "This is a test embed",
            color: 16711680
        }];
        await sendMessage(channelId, message, embeds);
        return NextResponse.json({ message: "Message sent" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }
}