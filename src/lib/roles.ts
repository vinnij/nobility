import { Action, Resource } from "@/types/perm";

export enum PermissionCategory {
    ADMIN_ACCESS = 'Admin Access',
    USER_MANAGEMENT = 'User Management',
    TICKET_MANAGEMENT = 'Ticket Management',
    SERVER_MANAGEMENT = 'Server Management',
    LEADERBOARD = 'Leaderboard',
    SEO = 'SEO',
    SETTINGS = 'Settings',
    LOGS = 'Logs',
}

export interface Permission {
    id: string
    title: string;
    description: string;
    resource: Resource;
    action: Action;
    category: PermissionCategory;
}

export const permissions: Permission[] = [
    { id: 'admin:read', title: 'Admin Access', description: 'Access the admin panel', resource: 'admin', action: 'read', category: PermissionCategory.ADMIN_ACCESS },

    { id: 'user:manage', title: 'Manage Users', description: 'Manage users information', resource: 'user', action: 'manage', category: PermissionCategory.USER_MANAGEMENT },
    { id: 'user_linked:read', title: 'View Linked Accounts', description: 'View linked accounts', resource: 'user_linked', action: 'read', category: PermissionCategory.USER_MANAGEMENT },
    { id: 'user_full:read', title: 'View Full User Details', description: 'View full user details, including transactions.', resource: 'user_full', action: 'read', category: PermissionCategory.USER_MANAGEMENT },
    { id: 'user_store:grant', title: 'Grant Store Packages', description: 'Grant store packages to users', resource: 'user_grant', action: 'create', category: PermissionCategory.USER_MANAGEMENT },

    { id: 'servers:manage', title: 'Manage Servers', description: 'Manage game servers', resource: 'servers', action: 'manage', category: PermissionCategory.SERVER_MANAGEMENT },
    { id: 'mapvoting:manage', title: 'Manage Map Voting', description: 'Manage map voting', resource: 'mapvoting', action: 'manage', category: PermissionCategory.SERVER_MANAGEMENT },

    { id: 'tickets:read', title: 'View Tickets', description: 'View support tickets', resource: 'tickets', action: 'read', category: PermissionCategory.TICKET_MANAGEMENT },
    { id: 'tickets:manage', title: 'Manage Tickets', description: 'Manage support tickets', resource: 'tickets', action: 'manage', category: PermissionCategory.TICKET_MANAGEMENT },

    { id: 'logs:read', title: 'View Logs', description: 'View Admin Logs', resource: 'logs', action: 'read', category: PermissionCategory.LOGS },
    { id: 'leaderboard:manage', title: 'Manage Leaderboard', description: 'Manage leaderboard settings', resource: 'leaderboard', action: 'manage', category: PermissionCategory.LEADERBOARD },
    { id: 'seo:manage', title: 'Manage SEO', description: 'Manage SEO settings', resource: 'seo', action: 'manage', category: PermissionCategory.SEO },
    { id: 'settings:manage', title: 'Manage Settings', description: 'Manage site settings', resource: 'settings', action: 'manage', category: PermissionCategory.SETTINGS },
    { id: 'settings_roles:manage', title: 'Manage Roles', description: 'Manage roles and their permissions', resource: 'settings_roles', action: 'manage', category: PermissionCategory.SETTINGS },
]