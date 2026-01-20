import { supabaseAdmin } from './supabase';

export type AuditAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'SEARCH';

export const AuditLogger = {
    log: async (
        action: AuditAction,
        resourceType: string,
        resourceId: string | null,
        actorId: string,
        details?: any
    ) => {
        try {
            // we fire and forget to not block the response time significantly
            // In a highly critical system, we might want to await this or use a queue.
            supabaseAdmin.from('audit_logs').insert({
                actor_id: actorId,
                action: action,
                resource_type: resourceType,
                resource_id: resourceId,
                details: details || {},
                timestamp: new Date().toISOString()
            }).then(({ error }) => {
                if (error) console.error("Audit Log Error:", error);
            });
        } catch (e) {
            console.error("Audit Logger Exception:", e);
        }
    }
};
