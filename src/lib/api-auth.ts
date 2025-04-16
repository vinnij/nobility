import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';
import { hasPermission } from './permissions/permissions';

// Helper function to verify the bearer token or session
async function verifyToken(request: Request): Promise<boolean> {
    // First check for bearer token
    const authHeader = request.headers.get('Authorization');
    if (authHeader === `Bearer ${process.env.API_BEARER_TOKEN!}`) {
        return true;
    }

    // If no valid bearer token, check for authenticated session
    const session = await getServerSession(authOptions())
    if (!session || (session.user.roles &&
        !(await hasPermission(session.user.roles, { resource: "admin", action: "read" }))
    )) {
        return false;
    }
    return true;
}

// Type for route handler functions
type RouteHandler<T> = (request: Request, params: T) => Promise<NextResponse>;

export function protectedRoute<T>(handler: RouteHandler<T>): RouteHandler<T> {
    return async (request: Request, params: T) => {
        if (!await verifyToken(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return handler(request, params);
    };
}