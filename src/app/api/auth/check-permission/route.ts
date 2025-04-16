import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions/permissions';
import { PermissionCheck } from '@/types/perm';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions());
        
        if (!session?.user) {
            return NextResponse.json({ hasPermission: false, error: 'Not authenticated' }, { status: 401 });
        }

        const { permission } = await request.json() as { permission: PermissionCheck };
        
        if (!permission) {
            return NextResponse.json({ hasPermission: false, error: 'Permission check required' }, { status: 400 });
        }

        const hasUserPermission = await hasPermission(session.user.roles.map(role => role.role), permission);
        
        return NextResponse.json({ hasPermission: hasUserPermission });
    } catch (error) {
        console.error('Permission check error:', error);
        return NextResponse.json({ hasPermission: false, error: 'Internal server error' }, { status: 500 });
    }
} 