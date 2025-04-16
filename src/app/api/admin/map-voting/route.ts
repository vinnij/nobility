import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { RustMap } from "@/types/vote";
import { hasPermission } from "@/lib/permissions/permissions";

// Define the validation schema
const createMapVoteFormSchema = z.object({
    server: z.string().min(1, { message: "Server ID is required" }),
    vote_start: z.string().datetime({ message: "Invalid start date" }),
    vote_end: z.string().datetime({ message: "Invalid end date" }),
    map_start: z.string().datetime({ message: "Invalid start date" }),
    map_options: z.array(
        z.object({
            value: z.string().min(1, { message: "Map option value is required" }),
        })
    ).min(2, { message: "At least two map options are required" }),
});

const editMapVoteFormSchema = z.object({
    id: z.string().min(1, { message: "Map vote ID is required" }),
    server: z.string().min(1, { message: "Server ID is required" }),
    vote_start: z.string().datetime({ message: "Invalid start date" }),
    vote_end: z.string().datetime({ message: "Invalid end date" }),
    map_start: z.string().datetime({ message: "Invalid start date" }),
    enabled: z.boolean(),
    map_options: z.array(
        z.object({
            value: z.string().min(1, { message: "Map option value is required" }),
        })
    ).min(2, { message: "At least two map options are required" }),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions());
        if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'mapvoting', action: 'manage' })))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        // Validate the incoming data
        const validationResult = createMapVoteFormSchema.safeParse(body);

        if (!validationResult.success) {
            const errorMessages = validationResult.error.errors.map(error => error.message);
            return NextResponse.json({ error: "Validation failed", details: errorMessages }, { status: 400 });
        }

        const validatedData = validationResult.data;

        const mapOptions: RustMap[] = [];
        for (const option of validatedData.map_options) {
            let idOrSizeSeed = option.value;
            if (idOrSizeSeed.startsWith("https://rustmaps.com") || idOrSizeSeed.startsWith("http://rustmaps.com")) {
                idOrSizeSeed = idOrSizeSeed.split("/").pop()!;
                if (idOrSizeSeed.includes("_")) {
                    idOrSizeSeed = idOrSizeSeed.split("/map/").pop()!.replace("_", "/");
                }
            }
            const response = await fetch(`https://api.rustmaps.com/v4/maps/${idOrSizeSeed}`, {
                headers: {
                    "X-API-Key": process.env.RUSTMAPS_API_KEY!
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    return NextResponse.json({ error: "Permission for RustMaps API denied" }, { status: 401 });
                }
                if (response.status === 404) {
                    return NextResponse.json({ error: "Map not found" }, { status: 404 });
                }
                if (response.status === 409) {
                    return NextResponse.json({ error: `Map with id ${option.value} is still generating, please try again later.` }, { status: 409 });
                }
                return NextResponse.json({ error: "Error fetching map data" }, { status: response.status });
            }

            const map = await response.json();
            mapOptions.push(map);
        }

        await prisma.mapVote.create({
            data: {
                server_id: validatedData.server,
                vote_start: new Date(validatedData.vote_start),
                vote_end: new Date(validatedData.vote_end),
                map_start: new Date(validatedData.map_start),
                map_options: {
                    connectOrCreate: mapOptions.map((option, index) => ({
                        where: { id: option.data.id },
                        create: {
                            id: option.data.id,
                            order: index,
                            url: option.data.url,
                            seed: option.data.seed,
                            size: option.data.size,
                            rawImageUrl: option.data.rawImageUrl,
                            imageUrl: option.data.imageUrl,
                            imageIconUrl: option.data.imageIconUrl,
                            thumbnailUrl: option.data.thumbnailUrl,
                        },
                    })),
                },
            },
        });

        return NextResponse.json({ message: "Map vote created successfully" }, { status: 201 });
    } catch (error) {
        console.error('Error creating map vote:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions());
        if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'mapvoting', action: 'manage' })))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const serverId = searchParams.get('serverId');
        const status = searchParams.get('status');

        let whereClause: any = {};

        if (serverId) {
            whereClause.server_id = serverId;
        }

        if (status === 'active') {
            whereClause.vote_end = {
                gte: new Date()
            };
        } else if (status === 'completed') {
            whereClause.vote_end = {
                lt: new Date()
            };
        }

        const mapVotes = await prisma.mapVote.findMany({
            where: whereClause,
            include: {
                map_options: {
                    include: {
                        userVotes: true
                    }
                },
                server: {
                    select: {
                        server_id: true,
                        server_name: true,
                        server_address: true,
                    }
                },
            },
            orderBy: {
                vote_start: 'desc',
            },
        });

        return NextResponse.json(mapVotes, { status: 200 });
    } catch (error) {
        console.error('Error fetching map votes:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions());
        if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'mapvoting', action: 'manage' })))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const body = await req.json();

        // Validate the incoming data
        const validationResult = editMapVoteFormSchema.safeParse(body);

        if (!validationResult.success) {
            console.log(validationResult.error.errors)
            const errorMessages = validationResult.error.errors.map(error => error.message);
            return NextResponse.json({ error: "Validation failed", details: errorMessages }, { status: 400 });
        }

        const validatedData = validationResult.data;

        // Check if the map vote exists
        const existingMapVote = await prisma.mapVote.findUnique({
            where: { id: validatedData.id },
            include: { map_options: true },
        });

        if (!existingMapVote) {
            return NextResponse.json({ error: "Map vote not found" }, { status: 204 });
        }

        const mapOptions: RustMap[] = [];
        for (const option of validatedData.map_options) {
            let idOrSizeSeed = option.value;
            if (idOrSizeSeed.startsWith("https://rustmaps.com") || idOrSizeSeed.startsWith("http://rustmaps.com")) {
                idOrSizeSeed = idOrSizeSeed.split("/").pop()!;
                if (idOrSizeSeed.includes("_")) {
                    idOrSizeSeed = idOrSizeSeed.split("/map/").pop()!.replace("_", "/");
                }
            }
            const response = await fetch(`https://api.rustmaps.com/v4/maps/${idOrSizeSeed}`, {
                headers: {
                    "X-API-Key": process.env.RUSTMAPS_API_KEY!
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    return NextResponse.json({ error: "Permission for RustMaps API denied" }, { status: 401 });
                }
                if (response.status === 204) {
                    return NextResponse.json({ error: "Map not found" }, { status: 204 });
                }
                if (response.status === 409) {
                    return NextResponse.json({ error: `Map with id ${option.value} is still generating, please try again later.` }, { status: 409 });
                }
                console.log(idOrSizeSeed)
                return NextResponse.json({ error: "Error fetching map data" }, { status: response.status });
            }

            const map = await response.json();
            mapOptions.push(map);
        }

        // Update the map vote
        await prisma.mapVote.update({
            where: { id: validatedData.id },
            data: {
                server_id: validatedData.server,
                vote_start: new Date(validatedData.vote_start),
                vote_end: new Date(validatedData.vote_end),
                map_start: new Date(validatedData.map_start),
                enabled: validatedData.enabled,
                map_options: {
                    connectOrCreate: mapOptions.map((option, index) => ({
                        where: { id: option.data.id },
                        create: {
                            id: option.data.id,
                            order: index,
                            url: option.data.url,
                            rawImageUrl: option.data.rawImageUrl,
                            imageUrl: option.data.imageUrl,
                            imageIconUrl: option.data.imageIconUrl,
                            thumbnailUrl: option.data.thumbnailUrl,
                        },
                    })),
                },
            },
        });

        return NextResponse.json({ message: "Map vote updated successfully" }, { status: 200 });
    } catch (error) {
        console.error('Error updating map vote:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions());
        if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'mapvoting', action: 'manage' })))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Map vote ID is required" }, { status: 400 });
        }

        // Check if the map vote exists
        const existingMapVote = await prisma.mapVote.findUnique({
            where: { id },
            include: {
                map_options: true,
            }
        });

        if (!existingMapVote) {
            return NextResponse.json({ error: "Map vote not found" }, { status: 404 });
        }

        await prisma.$transaction(async (tx) => {
            // 1. Delete all map options
            // (we have onDelete: Cascade, so we don't need to delete them manually but will do it to be safe)
            await tx.mapVoteOption.deleteMany({
                where: {
                    mapVoteId: id
                }
            });

            // 2. Delete the map vote
            await tx.mapVote.delete({
                where: { id }
            });
        });

        return NextResponse.json({ message: "Map vote deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error('Error deleting map vote:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
