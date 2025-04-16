"use server";

import { User } from "@/types/user";
import { getDiscordIntegration } from "./admin";
import { Role } from "@prisma/client";
import { hexToNumber } from "@/lib/utils";

export async function sendTicketWebhook(user: User, ticketId: number) {
    try {
        const { data: discordIntegration } = await getDiscordIntegration();
        if (!discordIntegration) {
            throw new Error("No Discord integration found");
        }

        if (!discordIntegration.ticketHookEnabled || !discordIntegration.ticketHookUrl) {
            return;
        }

        const color = discordIntegration.ticketHookColor ? hexToNumber(discordIntegration.ticketHookColor) : 2105893;
        const url = `${process.env.NEXTAUTH_URL}/admin`;
        const webhookBody = {
            embeds: [{
                description: `- [Open Ticket](${url}/ticket/${ticketId})`,
                color,
                fields: [
                    {
                        name: "Information",
                        value: `- <@${user.discordId}>\n- [Battlemetrics](https://www.battlemetrics.com/rcon/players?filter%5Bsearch%5D=${user.steamId})\n- [PayNow](https://dashboard.paynow.gg/customers/${user.storeId})`,
                        inline: true
                    },
                    {
                        name: "Extra Information",
                        value: `- [Website Profile](${url}/users/${user.steamId})\n- Ticket ID: [#${ticketId}](${url}/ticket/${ticketId})`,
                        inline: true
                    }
                ],
                author: {
                    name: `${user.name} has created a ticket.`,
                    icon_url: user.image
                },
                timestamp: new Date().toISOString()
            }]
        }
        await sendWebhook(discordIntegration.ticketHookUrl, webhookBody)
    } catch (error) {
        console.error('Error sending Discord webhook:', error);
    }
}

export async function sendVerifyWebhook(user: any, discordUser: any, steamProfile: any) {
    try {
        const { data: discordIntegration } = await getDiscordIntegration();
        if (!discordIntegration) {
            throw new Error("No Discord integration found");
        }

        if (!discordIntegration.verificationHookEnabled || !discordIntegration.webhookUrl) {
            return;
        }

        const color = discordIntegration.verificationHookColor ? hexToNumber(discordIntegration.verificationHookColor) : 2105893;
        const url = `${process.env.NEXTAUTH_URL}/admin/users/${user.steamId}`;
        const inGroup = user.joinedSteamGroup;
        console.log(user);
        const webhookBody = {
            embeds: [{
                color: color,
                thumbnail: { url: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` },
                fields: [
                    { name: "Discord ID", value: `\`\`\`${discordUser.id}\`\`\``, inline: true },
                    { name: "Steam ID", value: `\`\`\`${steamProfile.steamid}\`\`\``, inline: true },
                    {
                        name: "",
                        value: "",
                        inline: false,
                    },
                    {
                        name: "Account Links",
                        value: `• <@${discordUser.id}>\n• [Battlemetrics](https://www.battlemetrics.com/rcon/players?filter%5Bsearch%5D=${steamProfile.steamid})\n• [PayNow](https://dashboard.paynow.gg/customers/${user?.storeId})`,
                        inline: true,
                    },

                    { name: "Extra Info", value: `• Boosting Discord Server ${user.isBoosting ? ":ballot_box_with_check:" : ":regional_indicator_x:"}\n• Steam Group Member ${inGroup ? ":ballot_box_with_check:" : ":regional_indicator_x:"}\n• [Website Profile](${url})`, inline: true },
                ],
                author: {
                    name: `${steamProfile.personaname} has linked their accounts.`,
                    icon_url: steamProfile.avatar
                },
                timestamp: new Date().toISOString()
            }]
        }

        await sendWebhook(discordIntegration.webhookUrl, webhookBody)
    } catch (error) {
        console.error('Error sending Discord webhook:', error);
    }
}

export async function modifyDiscordRole(role: Role, userId: string, add: boolean) {
    try {
        const { data: discordIntegration } = await getDiscordIntegration();
        if (!discordIntegration || !discordIntegration.guildId) {
            console.log("No Discord integration found");
            return;
        }
        if (!role.discordRoleId) {
            throw new Error("You can not add a Discord role to a user without a Discord role ID");
        }
        const response = await fetch(`https://discordapp.com/api/v9/guilds/${discordIntegration.guildId}/members/${userId}/roles/${role?.discordRoleId}`, {
            method: add ? 'PUT' : 'DELETE',
            headers: {
                'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN!}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const data = await response.json();
            console.log(response.status,response.statusText)
            console.error(data);
            throw new Error(`Failed to add Discord role: ${data.message}`);
        }
    } catch (error) {
        console.error('Error adding Discord role:', error);
    }
}

export async function getGuildMembers(discordId: string) {
    try {
        const { data: discordIntegration } = await getDiscordIntegration();
        if (!discordIntegration || !discordIntegration.guildId) {
            console.log("No Discord integration found");
            return;
        }
        const response = await fetch(`https://discordapp.com/api/v9/guilds/${discordIntegration.guildId}/members/${discordId}`, {
            headers: {
                'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN!}`,
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error getting Discord guild members:', error);
    }
}


async function sendWebhook(webhookUrl: string, webhookBody: any) {
    if (!webhookUrl) {
        throw new Error("No webhook URL found");
    }
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json",
            },
            body: JSON.stringify(webhookBody)
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(`Failed to send Discord webhook: ${data.message}`);
        }
    } catch (error) {
        console.error('Error sending Discord webhook:', error);
    }
}

export async function openDMChannel(discordId: string): Promise<string | undefined> {
    /* const discordIntegration = await getDiscordIntegration();
    if (!discordIntegration || !discordIntegration.guildId) {
        console.log("No Discord integration found");
        return;
    } */
    const response = await fetch(`https://discordapp.com/api/v9/users/@me/channels`, {
        method: 'POST',
        headers: {
            'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN!}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            recipient_id: discordId
        })
    });
    const data = await response.json();
    if (!data.id) {
        throw new Error("Failed to open DM channel");
    }
    return data.id;
}

export async function sendMessage(channelId: string, message?: string, embeds?: any[]) {
    const response = await fetch(`https://discordapp.com/api/v9/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN!}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: message,
            tts: false,
            embeds: embeds
        })
    });
    const data = await response.json();
    return data;
}

