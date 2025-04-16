import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

async function handler(req: NextRequest, res: NextRequest) {
// @ts-expect-error
	return await NextAuth(req, res, authOptions(req));
}

export { handler as GET, handler as POST };
