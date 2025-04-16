import { Server } from "@/hooks/use-servers"
import { User } from "./user"

export interface MapVote {
    id: string
    enabled: boolean
    server_id: string
    server: Server
    map_options: MapVoteOption[]
    vote_start: Date
    vote_end: Date
    map_start: Date
    created_at: Date
    updated_at: Date
}

export interface MapVoteOption {
    id: string
    order?: number
    size?: number
    seed?: number
    rawImageUrl: string
    imageUrl: string
    imageIconUrl: string
    thumbnailUrl: string
    staging?: boolean
    userVotes: UserVote[]
    mapVoteId: string
    mapVote?: MapVote
    vote_count?: number
}

export interface UserVote {
    user_id: string
    vote_option_id: string
    vote_id: string
    vote?: MapVote
    vote_option?: MapVoteOption
    user: Partial<User>
}


export interface RustMap {
    meta: {
        status: string
        statusCode: number
        errors: string[]
    },
    data: {
        id: string
        type: string
        seed: number
        size: number
        saveVersion: number
        url: string
        rawImageUrl: string
        imageUrl: string
        imageIconUrl: string
        thumbnailUrl: string
        isStaging: boolean
        isCustomMap: boolean
        canDownload: boolean
        downloadUrl: string
        totalMonuments: number
        monuments: [
            {
                type: number
                coordinates: {
                    x: number
                    y: number
                },
                nameOverride: string
            }
        ],
        landPercentageOfMap: number
        biomePercentages: {
            s: number
            d: number
            f: number
            t: number
        }
        islands: number
        mountains: number
        iceLakes: number
        rivers: number
        lakes: number
        canyons: number
        oases: number
        buildableRocks: number
    }
}
