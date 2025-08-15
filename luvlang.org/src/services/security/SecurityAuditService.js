import { AuditLogService } from './audit/AuditLogService';
import { LogRetrievalService } from './audit/LogRetrievalService';
import { LogResolutionService } from './audit/LogResolutionService';
import { AdminActionService } from './audit/AdminActionService';
export class SecurityAuditService {
    static async logSecurityEvent(eventType, details, severity = 'low') {
        return AuditLogService.logSecurityEvent(eventType, details, severity);
    }
    static async getSecurityLogs(limit = 50) {
        return LogRetrievalService.getSecurityLogs(limit);
    }
    static async resolveSecurityLog(logId) {
        return LogResolutionService.resolveSecurityLog(logId);
    }
    static async logAdminAction(actionType, targetUserId, targetResource, details = {}) {
        return AdminActionService.logAdminAction(actionType, targetUserId, targetResource, details);
    }
}
