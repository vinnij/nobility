import { protectedRoute } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

const statTables = {
    pvp_stats: 'pvp_stats',
    resources_stats: 'resources_stats',
    explosives_stats: 'explosives_stats',
    farming_stats: 'farming_stats',
    misc_stats: 'misc_stats',
    events_stats: 'events_stats'
} as const;

// Column name to code mapping
const columnToCode: Record<string, string> = {
    // pvp_stats
    kills: 'A1',
    deaths: 'A2',
    suicides: 'A3',
    bullets_fired: 'A4',
    headshots: 'A5',

    // explosives_stats
    c4_thrown: 'B1',
    rockets_fired: 'B2',
    hv_rockets_fired: 'B3',
    incendiary_rockets_fired: 'B4',
    smoke_rockets_fired: 'B5',
    satches_thrown: 'B6',
    he_grenades_fired: 'B7',

    // resources_stats
    wood_farmed: 'C1',
    stone_farmed: 'C2',
    metal_frags_farmed: 'C3',
    hqm_farmed: 'C4',
    sulfur_farmed: 'C5',

    // farming_stats
    corn_harvested: 'D1',
    potatoes_harvested: 'D2',
    pumpkins_harvested: 'D3',
    mushrooms_harvested: 'D4',
    berries_harvested: 'D5',
    fish_gutted: 'D6',
    cloth_collected: 'D7',
    leather_harvested: 'D8',

    // event_stats
    hacked_crates_looted: 'E1',
    heli_kills: 'E2',
    bradley_kills: 'E3',
    missions_started: 'E4',
    missions_completed: 'E5',
    npc_kills: 'E6',

    // misc_stats
    time_played: 'F1',
    boats_purchased: 'F2',
    subs_purchased: 'F3',
    helis_purchased: 'F4',
    animal_kills: 'F5',
    supply_signals_called: 'F6'
};

// Code to column name mapping
const codeToColumn: Record<string, string> = Object.fromEntries(
    Object.entries(columnToCode).map(([key, value]) => [value, key])
);

type TotalCountResult = {
    total: bigint; // BigInt is used to match the COUNT query's return type
};

async function getTableColumns(tableName: string) {
    // This gets the column information for the specified table
    const columns = await prisma.$queryRaw<{ COLUMN_NAME: string }[]>`
        SELECT COLUMN_NAME 
        FROM information_schema.columns 
        WHERE table_name = ${tableName}
        AND COLUMN_NAME NOT IN ('steam_id', 'server_id');
    `;

    return columns.map(col => col.COLUMN_NAME);
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const tab = url.searchParams.get('tab') as keyof typeof statTables;
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('pageSize') || '10');
    const offset = (page - 1) * perPage;

    const sortField = url.searchParams.get('sortField') ?? undefined; // Optional
    const sortOrder = url.searchParams.get('sortOrder')?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'; // Default to ASC

    const filter = url.searchParams.get('filter') ?? undefined;
    const serverId = url.searchParams.get('server') ?? undefined;

    // Ensure table is valid
    if (!statTables[tab]) {
        return NextResponse.json({ error: 'Invalid tab specified' }, { status: 400 });
    }

    // Construct filters and joins
    const filters: string[] = [];
    const filterValues: any[] = [];
    let joinClause = `JOIN players ON players.steam_id = ${tab}.steam_id`;

    if (filter) {
        filters.push('(players.username LIKE ? OR players.steam_id = ?)');
        filterValues.push(`%${filter}%`, filter);
    }

    if (serverId && serverId.toLocaleLowerCase() !== 'global') {
        filters.push(`${tab}.server_id = ?`);
        filterValues.push(serverId);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const kdrClause = tab === "pvp_stats" ? `, CASE
        WHEN SUM(${tab}.deaths) = 0 THEN CAST(SUM(${tab}.kills) AS DECIMAL(10,2))
        ELSE CAST(SUM(${tab}.kills) AS DECIMAL(10,2)) / CAST(SUM(${tab}.deaths) AS DECIMAL(10,2))
    END AS kdr` : '';

    let orderByClause = '';
    try {
        // Get columns for the current table
        const tableColumns = await getTableColumns(tab);

        if (sortField) {
            if (tab === 'pvp_stats' && sortField === 'kdr') {
                orderByClause = `ORDER BY CASE 
                    WHEN SUM(${tab}.deaths) = 0 THEN SUM(${tab}.kills)
                    ELSE CAST(SUM(${tab}.kills) AS DECIMAL(10,2)) / CAST(SUM(${tab}.deaths) AS DECIMAL(10,2)) 
                END ${sortOrder}`
            } else if (tableColumns.includes(sortField)) {
                orderByClause = `ORDER BY SUM(${tab}.${sortField}) ${sortOrder}`;
            }
        }

        const statsQuery = `
            SELECT 
                players.steam_id,
                players.username,
                ${tableColumns
                .map(column => `SUM(${tab}.${column}) as ${column}`)
                .join(',')}
                ${kdrClause}
            FROM ${tab}
            ${joinClause}
            ${whereClause}
            GROUP BY players.steam_id, players.username
            ${orderByClause}
            LIMIT ${perPage}
            OFFSET ${offset}
        `;

        const totalCountQuery = `
        SELECT COUNT(*) as total
        FROM ${tab}
        ${joinClause}
        ${whereClause}
        `;

        // Execute queries
        const statsData = await prisma.$queryRawUnsafe<any[]>(statsQuery, ...filterValues);
        const totalCountResults = await prisma.$queryRawUnsafe<TotalCountResult[]>(totalCountQuery, ...filterValues);

        // Ensure totalCountResults is an array and convert BigInt to number
        const total = Number(totalCountResults[0]?.total || 0);

        const totalPages = Math.ceil(total / perPage);

        return NextResponse.json({ data: statsData, totalPages, totalCount: total });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Query failed' }, { status: 500 });
    }
}

// Add this type definition
type StatUpdate = {
    steamId: string;
    serverId: string;
    [key: string]: any;
};

type StatTableKey = keyof typeof statTables;

async function upsertStats<T extends StatTableKey>(
    table: T,
    steamId: string,
    serverId: string,
    stats: Record<string, number>
) {
    const prismaModel = (prisma as any)[table];
    if (!prismaModel) {
        throw new Error(`Invalid table: ${table}`);
    }

    const data = {
        steam_id: steamId,
        server_id: serverId,
        ...stats
    };
    try {
        const count = await prisma.players.count({
            where: {
                steam_id: steamId
            }
        });
        if (count === 0) {
            return;
        }
        await prismaModel.upsert({
            where: {
                steam_id_server_id: {
                    steam_id: steamId,
                    server_id: serverId
                }
            },
            create: data,
            update: Object.fromEntries(
                Object.entries(stats).map(([key, value]) => [
                    key,
                    { increment: typeof value === "bigint" ? value : BigInt(value) },
                ])
            )
        });
    } catch (error) {
        console.error('Error upserting stats:', error);
    }
}
// Add this function to fetch column mappings
async function getColumnMappings(): Promise<Record<string, keyof typeof statTables>> {
    const mappings = await prisma.leaderboardColumn.findMany({
        select: {
            columnKey: true,
            tab: {
                select: {
                    tabKey: true
                }
            }
        }
    });

    return mappings.reduce((acc, mapping) => {
        acc[mapping.columnKey] = mapping.tab.tabKey as keyof typeof statTables;
        return acc;
    }, {} as Record<string, keyof typeof statTables>);
}

// Replace the existing getTableForStat function with this
let columnMappings: Record<string, keyof typeof statTables> | null = null;

async function getTableForStat(stat: string): Promise<keyof typeof statTables> {
    if (!columnMappings) {
        columnMappings = await getColumnMappings();
    }
    return columnMappings[stat];
}

export const POST = protectedRoute(async (req: Request) => {
    try {
        const updates = await req.json();

        if (!Array.isArray(updates)) {
            console.error('Invalid updates format', updates);
            return NextResponse.json({ error: 'Invalid updates format' }, { status: 400 });
        }

        updates.forEach((stat) => {
            const { steamId, serverId, ...encodedStats } = stat;
            
            // Check if any of the encoded stats match our known codes
            const hasValidStats = Object.keys(encodedStats).some(code => 
                Object.values(columnToCode).includes(code.toUpperCase())
            );

            if (hasValidStats) {
                console.log('Valid stat update:', stat);
            } else {
                console.error('Invalid stat update:', stat);
            }
            
            return hasValidStats;
        })

        if (updates.length === 0) {
            return NextResponse.json({ success: true }, { status: 200 });
        }

        const servers = (await prisma.servers.findMany({
            select: {
                server_id: true
            }
        })).map(server => server.server_id);

        // Validate that each update has steamId and serverId
        // Each server id must be created via the admin panel
        const invalidUpdates = updates.filter(update => {
            if (!update.steamId || !update.serverId) {
                return true;
            }
            if (!servers.includes(update.serverId)) {
                return true;
            }
            return false;
        });
        if (invalidUpdates.length > 0) {
            console.error('All updates must include steamId and serverId. Every server id must also be created via the admin panel.', invalidUpdates);
            return NextResponse.json({ error: 'All updates must include steamId and serverId. Every server id must also be created via the admin panel.' }, { status: 400 });
        }

        await Promise.all(updates.map(async (update: StatUpdate) => {
            const { steamId, serverId, ...encodedStats } = update;

            const count = await prisma.players.count({
                where: { steam_id: steamId }
            });
            if (count > 0) {
                await prisma.players.update({
                    where: { steam_id: steamId },
                    data: {
                        lastSeen: new Date(),
                        lastSeenServerId: serverId
                    }
                });
            }

            // Decode the stats
            const stats = Object.fromEntries(
                Object.entries(encodedStats).map(([code, value]) => [codeToColumn[code.toUpperCase()], value])
            );

            // Initialize groupedStats with all possible keys
            const groupedStats: Record<StatTableKey, Record<string, number>> = Object.keys(statTables).reduce((acc, key) => {
                acc[key as StatTableKey] = {};
                return acc;
            }, {} as Record<StatTableKey, Record<string, number>>);

            // Group stats by table
            for (const [key, value] of Object.entries(stats)) {
                const table = await getTableForStat(key);
                if (table && groupedStats[table]) {
                    groupedStats[table][key] = value;
                } else {
                    console.warn(`Unrecognized stat or table: ${key}`);
                }
            }

            await Promise.all(
                Object.entries(groupedStats).map(async ([table, tableStats]) => {
                    if (Object.keys(tableStats).length > 0) {
                        await upsertStats(table as StatTableKey, steamId, serverId, tableStats);
                    }
                })
            );

            return { steamId, serverId };
        }));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Update failed', details: (error as Error).message }, { status: 500 });
    }
});

/* type InsertStatsParams = {
    table: string;
    steamId: string;
    serverId: number;
    data: Record<string, number>;  // Key-value pairs of the stat fields
};

export const insertStats = async ({
    table,
    steamId,
    serverId,
    data,
}: InsertStatsParams) => {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data).join(', ');

    const result = await prisma.$queryRawUnsafe(`
      INSERT INTO ${table} (steam_id, server_id, ${columns})
      VALUES ('${steamId}', ${serverId}, ${values})
    `);

    return result;
}; */
