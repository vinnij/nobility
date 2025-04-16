import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's id. */
      id: string
      name: string | null
      roles: UserRole[]
      discordId?: string
      storeId?: string
      steamId?: string
      createdAt: Date
      joinedSteamGroup: boolean
      isAdmin: boolean
      isBoosting: boolean
    } & DefaultSession["user"]
  }
}

export type UserSession = {
  /** The user's id. */
  id: string
  name: string | null
  roles: UserRole
  discordId?: string
  storeId?: string
  steamId?: string
  joinedSteamGroup: boolean
  isBoosting: boolean
  isAdmin: boolean
  createdAt: Date
} & DefaultSession["user"]