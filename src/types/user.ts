import { Permission } from "@/lib/roles";

export interface User {
    id: string;
    name: string | null;
    email: string | null;
    image?: string | null;
    steamId?: string;
    discordId?: string;
    storeId: string | null;
    roles: UserRole[];
    joinedSteamGroup: boolean
    isBoosting: boolean
    createdAt: Date;
}

export type UserRole = {
    userId: string
    roleId: string
    role?: Role
}

export type Role = {
    id: string;
    name: string;
    permissions?: Partial<Permission>[];
    discordRoleId: string | null;
    discordGuildId: string | null;
    serverId: string | null;
    oxideGroupName: string | null;
    assignOnVerification: boolean | null;
    assignOnBoost: boolean | null;
    assignOnGroupJoin: boolean | null;
    color: string | null;
    users?: {
        id: string
        name: string
        image: string
    }[];
}