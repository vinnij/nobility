import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { protectedRoute } from '@/lib/api-auth';

const dateOrTimestampSchema = z.union([
    z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date string",
    }),
    z.number().int().positive(),
]);

const searchParamsSchema = z.object({
    action: z.string().optional(),
    userId: z.string().optional(),
    targetId: z.string().optional(),
    roleId: z.string().optional(),
    serverId: z.string().optional(),
    startDate: dateOrTimestampSchema.optional(),
    endDate: dateOrTimestampSchema.optional(),
    page: z.string().default('1'),
    limit: z.string().default('10'),
    minimize: z.enum(['true', 'false']).optional(),
    type: z.enum(['oxide', 'discord']).optional(),
});

function parseDate(value: string | number): Date {
    return typeof value === 'number' ? new Date(value) : new Date(value);
}

export const dynamic = 'force-dynamic';

export const GET = protectedRoute(async (request: Request) => {
    try {
        const url = new URL(request.url);
        const searchParams = searchParamsSchema.parse(Object.fromEntries(url.searchParams));
        const {
            action,
            userId,
            targetId,
            roleId,
            startDate,
            endDate,
            page,
            limit,
            serverId,
            minimize,
            type,
        } = searchParams;

        // If minimize is true, startDate is required
        if (minimize === 'true' && !startDate) {
            return NextResponse.json({ error: 'startDate is required when minimize is true' }, { status: 400 });
        }

        const where: any = {};

        if (action) where.action = action;
        if (userId) where.userId = userId;
        if (targetId) where.details = { path: '$.targetId', equals: targetId };
        if (serverId) where.OR = [
            { details: { path: '$.role.serverId', equals: serverId } },
            { details: { path: '$.role.serverId', equals: "global" } }
        ];
        if (roleId) {
            where.OR = [
                { details: { path: '$.role.id', equals: roleId } },
                { details: { path: '$.oldRole.id', equals: roleId } },
                { details: { path: '$.newRole.id', equals: roleId } },
            ];
        }
        if (type) {
            where.OR = [
                ...where.OR,
                {
                    path: type === 'oxide' ? '$.oxideGroupName' : '$.discordRoleId', not: null
                }
            ]
        }
        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate) where.timestamp.gte = parseDate(startDate);
            if (endDate) where.timestamp.lte = parseDate(endDate);
        }

        if (minimize === 'true') {
            const logs = await prisma.adminLog.findMany({
                where,
                orderBy: { timestamp: 'desc' },
                select: {
                    action: true,
                    timestamp: true,
                    details: true,
                },
            });

            return NextResponse.json({
                logs: logs.map((log) => {
                    const { role, ...details } = log.details as any;
                    const val = {
                        action: log.action,
                        timestamp: log.timestamp,
                        ...details,
                        ...(role),
                    }
                    return val;
                })
            });
        }

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;

        const [logs, totalCount] = await Promise.all([
            prisma.adminLog.findMany({
                where,
                orderBy: { timestamp: 'desc' },
                skip,
                take: limitNumber,
                include: { user: { select: { id: true, name: true, image: true } } },
            }),
            prisma.adminLog.count({ where }),
        ]);

        return NextResponse.json({
            logs,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(totalCount / limitNumber),
                totalItems: totalCount,
            },
        });
    } catch (error) {
        console.error('Error fetching admin logs:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});

export const DELETE = protectedRoute(async () => {
    try {
        await prisma.adminLog.deleteMany({});
        return NextResponse.json({ message: 'All logs cleared successfully' });
    } catch (error) {
        console.error('Error clearing admin logs:', error);
        return NextResponse.json({ error: 'Failed to clear logs' }, { status: 500 });
    }
});
