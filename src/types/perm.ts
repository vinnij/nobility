export type Resource = 'admin' | 'user' | 'user_linked' | 'user_full' | 'user_grant' |
'servers' | 'mapvoting' | 'tickets' | 'logs' | 'leaderboard' | 'seo' | 'settings' | 'settings_roles';
export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage';

export interface PermissionCheck {
    resource: Resource;
    action: Action;
}