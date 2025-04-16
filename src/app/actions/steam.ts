"use server";

import { prisma } from "@/lib/db";
import { getSiteSettings } from "./admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAdminLog } from "./actions";
import { Role } from "@prisma/client";

const GROUP_URL = `http://api.steampowered.com/ISteamUser/GetUserGroupList/v1/?key=${process.env.STEAM_SECRET}&steamid=`

export interface SteamGroupResponse {
    error?: string;
    status?: number;
    data?: {
        status: 'no_change_needed' | 'role_revoked' | 'role_assigned' | 'no_action_needed';
    };
}

export async function hasJoinedSteamGroup(steamId: string): Promise<{ data?: boolean, error?: string, status?: number }> {
    try {
        const { data } = await fetchData(GROUP_URL + steamId);
        return { data };
    } catch (error) {
        console.error('Error checking steam group:', error);
        return { data: false, error: "Failed to check steam group", status: 500 };
    }
}

async function fetchData(url: string) {
    try {
        const siteSettings = await getSiteSettings()
        if (!siteSettings.data) {
            return { error: "Site settings not found", status: 500 };
        }
        if (!siteSettings.data.steamGroupId) {
            return { error: "Steam group ID not found", status: 500 };
        }
        const resp = await fetch(url);
        if (!resp.ok) {
            return { error: `Response status: ${resp.status}`, status: resp.status };
        }
        const { response } = await resp.json();
        let joined = false;
        for (let index = 0; index < response.groups.length; index++) {
            const element = response.groups[index];
            if (element.gid === siteSettings.data.steamGroupId) {
                joined = true;
                break;
            }
        }
        return { data: joined };
    } catch (error) {
        console.error('Error fetching steam data:', error);
        return { error: "An unexpected error occurred", status: 500 };
    }
}

export async function refreshSteamGroup(): Promise<SteamGroupResponse> {
    const session = await getServerSession(authOptions())
    if (!session) {
        return { error: "Unauthorized", status: 401 }
    }

    const user = session.user;
    const userRoles = user.roles.filter(role => role.assignOnGroupJoin);

    const steamAccount = await prisma.account.findFirst({
        where: {
            userId: user.id,
            provider: "steam",
        }
    });

    if (!steamAccount) {
        return { error: "Steam account not found", status: 404 }
    }

    try {
        const result = await hasJoinedSteamGroup(steamAccount.providerAccountId);
        if ('error' in result && result.error) {
            return { error: result.error, status: result.status };
        }
        const joinedSteamGroup = result.data ?? false;

        // They already have a role assigned, so we don't need to assign another one
        if (joinedSteamGroup && userRoles.length > 0) {
            return { data: { status: "no_change_needed" } };
        }

        // They are no longer in the group, so we need to revoke their role
        if (!joinedSteamGroup && userRoles.length > 0) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    joinedSteamGroup: false
                }
            })
            await assignOrRevokeRole(user.id, userRoles[0], false);
            return { data: { status: "role_revoked" } };
        }

        // They are in the group and don't have a role assigned, so we need to assign them one
        if (joinedSteamGroup && userRoles.length === 0) {
            const roleToAdd = await prisma.role.findFirst({
                where: {
                    assignOnGroupJoin: true
                }
            });
            if (!roleToAdd) {
                return { error: "No role found to assign", status: 404 };
            }
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    joinedSteamGroup: true
                }
            })
            await assignOrRevokeRole(user.id, roleToAdd, true);
            return { data: { status: "role_assigned" } };
        }

        return { data: { status: "no_action_needed" } };
    } catch (error) {
        console.error('Error refreshing steam group:', error);
        return { error: "Failed to refresh steam group", status: 500 };
    }
}

async function assignOrRevokeRole(userId: string, role: Role, assign: boolean) {
    await prisma.user.update({
        where: {
            id: userId
        },
        data: { roles: { [assign ? "connect" : "disconnect"]: { id: role.id } } }
    });
    await createAdminLog(
        undefined,
        assign ? "ROLE_ASSIGNED" : "ROLE_REVOKED",
        {
            targetId: userId,
            role: {
                id: role.id,
                name: role.name,
                oxideGroupName: role.oxideGroupName,
                serverId: role.serverId,
                discordRoleId: role.discordRoleId,
                discordGuildId: role.discordGuildId,
            }
        }
    )
}