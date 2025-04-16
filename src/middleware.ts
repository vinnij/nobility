import { getSession } from 'next-auth/react';
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { PermissionCheck } from './types/perm';

// Define protected routes that require authentication
const authRoutes = ["/profile"];

// Define admin routes with their required permissions
const adminRoutes: { path: string, permission: PermissionCheck }[] = [
    { path: "/admin/leaderboard", permission: { resource: 'leaderboard', action: 'manage'} },
    { path: "/admin/tickets", permission: { resource: 'tickets', action: 'read' } },
    { path: "/admin/ticket-settings", permission: { resource: 'tickets', action: 'manage' } },
    { path: "/admin/logs", permission: { resource: 'logs', action: 'read' } },
    { path: "/admin/seo", permission: { resource: 'seo', action: 'manage' } },
    { path: "/admin/servers", permission: { resource: 'servers', action: 'manage' } },
    { path: "/admin/settings", permission: { resource: 'settings', action: 'manage' } }
];

async function checkPermission(permission: PermissionCheck, cookie: string): Promise<boolean> {
    try {
        const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/check-permission`, {
            cache: 'no-store',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie
            },
            body: JSON.stringify({ permission })
        });

        if (!response.ok) {
            return false;
        }

        const data = await response.json();
        return data.hasPermission;
    } catch (error) {
        console.error('Permission check failed:', error);
        return false;
    }
}

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const cookie = request.headers.get('cookie') ?? '';

    // Get user session from cookies
    const session = await getSession({
        req: { headers: { cookie } }
    });

    // Handle authentication for protected routes
    if (!session && authRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL("/link", request.url));
    }

    // Handle admin routes
    if (pathname.startsWith("/admin")) {
        // Redirect to login if not authenticated
        if (!session?.user) {
            return NextResponse.redirect(new URL("/link", request.url));
        }

        // Check basic admin access
        const hasAdminAccess = await checkPermission({ resource: 'admin', action: "read" }, cookie);
        if (!hasAdminAccess) {
            return NextResponse.redirect(new URL("/403", request.url));
        }

        // Check specific route permissions
        const requiredPermission = adminRoutes.find(route => pathname.startsWith(route.path))?.permission;
        if (requiredPermission) {
            const hasRoutePermission = await checkPermission(requiredPermission, cookie);
            if (!hasRoutePermission) {
                return NextResponse.redirect(new URL("/403", request.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/profile", "/admin/:path*"],
    unstable_allowDynamic: ['/node_modules/@babel/runtime/regenerator/**'],
};