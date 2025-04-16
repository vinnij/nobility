import { sendMessage } from "@/app/actions/discord"
import { openDMChannel } from "@/app/actions/discord"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { hexToNumber } from "@/lib/utils"
import { TicketMessage } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { uploadToR2, validateFile } from "@/lib/upload"

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions())
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = params
    const messages = await prisma.ticketMessage.findMany({
        where: {
            ticketId: parseInt(id as string),
        },
        include: {
            user: {
                select: {
                    name: true,
                    image: true,
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
    return NextResponse.json(messages)
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions())
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const message = formData.get('message')
        const files = formData.getAll('files')

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            )
        }

        // Handle file uploads
        const uploadedUrls: string[] = []

        if (files && files.length > 0) {
            for (const file of files) {
                if (!(file instanceof File)) {
                    continue
                }

                // Validate file
                const validation = validateFile(file, 5, [
                    "image/png",
                    "image/jpeg",
                    "image/jpg",
                    "image/gif",
                    "image/webp"
                ])
                if (!validation.isValid) {
                    return NextResponse.json(
                        { error: validation.error },
                        { status: 400 }
                    )
                }

                // Upload to R2
                const result = await uploadToR2(
                    file,
                    file.name,
                    file.type,
                    `tickets/${params.id}`
                )

                if (!result.success || !result.url) {
                    return NextResponse.json(
                        { error: result.error || "Failed to upload file" },
                        { status: 500 }
                    )
                }

                uploadedUrls.push(result.url)
            }
        }

        const ticketMessage = await prisma.ticketMessage.create({
            data: {
                content: message,
                attachments: JSON.stringify(uploadedUrls),
                ticket: {
                    connect: {
                        id: parseInt(params.id),
                    }
                },
                user: {
                    connect: {
                        id: session.user.id
                    }
                },
            }
        })

        await handleDiscordNotification(ticketMessage);

        return NextResponse.json({
            success: true,
            message: "Message sent successfully",
            data: {
                ...ticketMessage,
                attachments: JSON.parse(ticketMessage.attachments)
            }
        })

    } catch (error) {
        console.error("Error in POST /api/admin/tickets/[id]/messages:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

async function handleDiscordNotification(ticketMessage: TicketMessage) {
    const ticket = await prisma.ticket.findUnique({
        where: {
            id: ticketMessage.ticketId
        }
    });
    if (!ticket) {
        return;
    }
    const account = await prisma.account.findFirst({
        where: {
            userId: ticket.userId,
            provider: "discord",
        }
    });
    if (!account) {
        return;
    }
    const channelId = await openDMChannel(account.providerAccountId);
    if (!channelId) {
        return;
    }

    const discordIntegration = await prisma.discordIntegration.findFirst();
    if (!discordIntegration || !discordIntegration.ticketHookEnabled) {
        return;
    }
    const color = discordIntegration.ticketHookColor ? hexToNumber(discordIntegration.ticketHookColor) : 2105893;
    const message = `You received a new message in ticket [#${ticket.id}](${process.env.NEXTAUTH_URL}/ticket/${ticket.id}).`;
    const embeds = [{
        title: "New Ticket Message",
        description: message,
        color: color
    }];
    try {
        await sendMessage(channelId, undefined, embeds);
    } catch (error) {
        console.error(error);
    }
}