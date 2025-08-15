import { supabase } from '@/integrations/supabase/client';
import { SecurityCoreService } from '../SecurityCoreService';
export class AuditLogService {
    static async logSecurityEvent(eventType, details, severity = 'low') {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const logEntry = {
                user_id: user?.id || undefined,
                event_type: eventType,
                severity,
                details: typeof details === 'string' ? { message: details } : details,
                user_agent: navigator.userAgent,
                fingerprint: SecurityCoreService.generateDeviceFingerprint(),
                session_id: user?.id ? `session_${user.id}_${Date.now()}` : undefined
            };
            const { error } = await supabase
                .from('security_logs')
                .insert(logEntry);
            if (error) {
                console.error('Failed to log security event to database:', error);
                this.fallbackLog(logEntry, error.message);
            }
        }
        catch (error) {
            console.error('Security logging error:', error);
        }
    }
    static fallbackLog(logEntry, errorReason) {
        try {
            const fallbackLogs = JSON.parse(localStorage.getItem('security_logs_fallback') || '[]');
            fallbackLogs.push({
                ...logEntry,
                timestamp: new Date().toISOString(),
                fallback_reason: errorReason
            });
            localStorage.setItem('security_logs_fallback', JSON.stringify(fallbackLogs.slice(-100)));
        }
        catch (error) {
            console.error('Fallback logging failed:', error);
        }
    }
}
