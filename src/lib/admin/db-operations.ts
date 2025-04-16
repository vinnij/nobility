import { PrismaClient, Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { hasPermission } from '../permissions/permissions'
const prisma = new PrismaClient()

async function isAuthorizedAdmin() {
    const session = await getServerSession(authOptions())
    return session?.user.roles && hasPermission(session.user.roles, { resource: "leaderboard", action: "manage" })
}

export async function createLeaderboardTable(tableName: string): Promise<boolean> {
    if (!await isAuthorizedAdmin()) {
        throw new Error("Unauthorized: Only admins can perform this operation")
    }

    // Validate table name
    if (!isValidTableName(tableName)) {
        throw new Error("Invalid table name")
    }

    const query = Prisma.sql`
        CREATE TABLE IF NOT EXISTS ${Prisma.raw(tableName)} (
            steam_id VARCHAR(255),
            server_id VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (steam_id, server_id),
            FOREIGN KEY (steam_id) REFERENCES players(steam_id) ON DELETE CASCADE,
            INDEX idx_steam_id (steam_id),
            INDEX idx_server_id (server_id),
            INDEX idx_created_at (created_at)
        )
    `

    try {
        await prisma.$executeRaw(query)
        console.log(`Table ${tableName} created successfully`)
        return true
    } catch (error) {
        console.error(`Error creating table ${tableName}:`, error)
        return false
    }
}

export async function dropTable(tableName: string): Promise<boolean> {
    if (!await isAuthorizedAdmin()) {
        throw new Error("Unauthorized: Only admins can perform this operation")
    }

    // Validate table name
    if (!isValidTableName(tableName)) {
        throw new Error("Invalid table name")
    }

    try {
        await prisma.$executeRaw(Prisma.sql`DROP TABLE IF EXISTS ${Prisma.raw(tableName)}`)
        console.log(`Table ${tableName} dropped successfully`)
        return true
    } catch (error) {
        console.error(`Error dropping table ${tableName}:`, error)
        return false
    }
}

function isValidTableName(tableName: string): boolean {
    // Implement a strict validation for table names
    // For example, only allow alphanumeric characters and underscores
    return /^[a-zA-Z0-9_]+$/.test(tableName)
}