
import { AuditLogService } from './audit/AuditLogService';
import { LogRetrievalService } from './audit/LogRetrievalService';
import { LogResolutionService } from './audit/LogResolutionService';
import { AdminActionService } from './audit/AdminActionService';
import { SecurityLogEntry } from '@/types/security';

export class SecurityAuditService {
  static async logSecurityEvent(
    eventType: string,
    details: string | Record<string, any>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
  ): Promise<void> {
    const detailsObj = typeof details === 'string' ? { message: details } : details;
    return AuditLogService.logSecurityEvent(eventType, severity, detailsObj);
  }

  static async getSecurityLogs(limit: number = 50): Promise<SecurityLogEntry[]> {
    return LogRetrievalService.getSecurityLogs(limit);
  }

  static async resolveSecurityLog(logId: string): Promise<void> {
    return LogResolutionService.resolveSecurityLog(logId, 'Resolved via SecurityAuditService');
  }

  static async logAdminAction(
    actionType: string,
    targetUserId?: string,
    targetResource?: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    return AdminActionService.logAdminAction(actionType, targetUserId, targetResource, details);
  }
}
