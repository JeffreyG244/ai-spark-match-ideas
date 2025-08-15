import { supabase } from '@/integrations/supabase/client';
export class LogRetrievalService {
    static async getSecurityLogs(limit = 50) {
        try {
            const { data, error } = await supabase
                .from('security_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);
            if (error) {
                throw error;
            }
            return (data || []).map(log => ({
                id: log.id,
                user_id: log.user_id || undefined,
                event_type: log.event_type,
                severity: log.severity,
                details: this.convertSupabaseJsonToRecord(log.details),
                ip_address: this.convertToString(log.ip_address),
                user_agent: log.user_agent || undefined,
                session_id: log.session_id || undefined,
                fingerprint: log.fingerprint || undefined,
                created_at: log.created_at || undefined,
                resolved: log.resolved || false,
                resolved_by: log.resolved_by || undefined,
                resolved_at: log.resolved_at || undefined
            }));
        }
        catch (error) {
            console.error('Error fetching security logs:', error);
            return [];
        }
    }
    static convertSupabaseJsonToRecord(jsonData) {
        if (!jsonData)
            return {};
        if (typeof jsonData === 'object')
            return jsonData;
        try {
            return JSON.parse(jsonData);
        }
        catch {
            return { raw: jsonData };
        }
    }
    static convertToString(value) {
        if (value === null || value === undefined)
            return undefined;
        return String(value);
    }
}
