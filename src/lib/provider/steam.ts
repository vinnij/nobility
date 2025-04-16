import { randomUUID } from 'crypto'
import { RelyingParty } from 'openid'
import { TokenSet } from 'openid-client'

import {
    EMAIL_DOMAIN,
    PROVIDER_ID,
    PROVIDER_NAME,
    SteamProfile
} from './constants'

import type { NextApiRequest } from 'next'
// @ts-expect-error
import type { OAuthConfig, OAuthUserConfig } from 'next-auth/providers'

import type { NextRequest } from 'next/server'

// prettier-ignore
export interface SteamProviderOptions extends Partial<OAuthUserConfig<SteamProfile>> {
    /** @example 'https://example.com/api/auth/callback' */
    callbackUrl: string | URL;
    clientSecret: string;
}

export function Steam(
    req: NextApiRequest | NextRequest,
    options: SteamProviderOptions
): OAuthConfig<SteamProfile> {
    const callbackUrl = new URL(options.callbackUrl)

    // https://example.com
    // https://example.com/api/auth/callback/steam
    const realm = callbackUrl.origin
    const returnTo = `${callbackUrl.href}/${PROVIDER_ID}`
    return {
        options,
        id: PROVIDER_ID,
        name: PROVIDER_NAME,
        type: 'oauth',
        style: {
            logo: 'https://raw.githubusercontent.com/Nekonyx/next-auth-steam/12444ac8e7c44f8a69fa007b056f892240cb1a27/logo/steam.svg',
            logoDark:
                'https://raw.githubusercontent.com/Nekonyx/next-auth-steam/12444ac8e7c44f8a69fa007b056f892240cb1a27/logo/steam-dark.svg',
            bg: '#fff',
            text: '#000',
            bgDark: '#000',
            textDark: '#fff'
        },
        idToken: false,
        checks: ['none'],
        clientId: PROVIDER_ID,
        authorization: {
            url: 'https://steamcommunity.com/openid/login',
            params: {
                'openid.mode': 'checkid_setup',
                'openid.ns': 'http://specs.openid.net/auth/2.0',
                'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
                'openid.claimed_id':
                    'http://specs.openid.net/auth/2.0/identifier_select',
                'openid.return_to': returnTo,
                'openid.realm': realm
            }
        },
        token: {
            async request() {
                // May throw an error, dunno should I handle it or no
                // prettier-ignore
                const claimedIdentifier = await verifyAssertion(req.url!, realm, returnTo)

                if (!claimedIdentifier) {
                    throw new Error('Unauthenticated')
                }

                const matches = claimedIdentifier.match(
                    /^https?:\/\/steamcommunity\.com\/openid\/id\/(\d+)$/
                )

                if (!matches) {
                    throw new Error('Unauthenticated')
                }

                return {
                    tokens: new TokenSet({
                        id_token: randomUUID(),
                        access_token: randomUUID(),
                        providerAccountId: matches[1]
                    })
                }
            }
        },
        userinfo: {
            async request(ctx: any) {
                const response = await fetch(
                    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${ctx.provider.clientSecret}&steamids=${ctx.tokens.providerAccountId}`
                )
                const data = await response.json()

                return data.response.players[0]
            }
        },
        profile(profile: SteamProfile) {
            // next.js can't serialize the session if email is missing or null, so I specify user ID
            return {
                id: profile.steamid,
                image: profile.avatarfull,
                email: `${profile.steamid}@${EMAIL_DOMAIN}`,
                name: profile.personaname
            }
        }
    }
}

/**
 * Verifies an assertion and returns the claimed identifier if authenticated, otherwise null.
 */
async function verifyAssertion(
    url: string,
    realm: string,
    returnTo: string
): Promise<string | null> {
    const query = Object.fromEntries(new URL(url).searchParams)

    if (!query['openid.claimed_id']) {
        throw new Error('Claimed identity is invalid')
    }

    const verifyParams = {
        ...query,
        'openid.mode': 'check_authentication'
    }

    const verifyUrl = new URL('https://steamcommunity.com/openid/login')
    const body = new URLSearchParams(verifyParams).toString()

    const response = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(body).toString(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Referer': 'https://steamcommunity.com/',
            'Origin': 'https://steamcommunity.com'
        },
        body
    })

    if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`)
    }

    const responseText = await response.text()
    const isValid = responseText.split('\n').some(line => line.trim() === 'is_valid:true')

    if (!isValid) {
        throw new Error('Invalid OpenID response')
    }

    return query['openid.claimed_id']
}