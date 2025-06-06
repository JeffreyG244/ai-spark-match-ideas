
import { SecurityAuditService } from './SecurityAuditService';
import { SecurityCoreService } from './SecurityCoreService';

export interface SecurityStatus {
  sessionValid: boolean;
  deviceTrusted: boolean;
  lastSecurityCheck: Date;
  riskLevel: 'low' | 'medium' | 'high';
  securityScore: number;
}

export class MonitoringService {
  static detectAutomationIndicators(): string[] {
    const indicators = SecurityCoreService.detectAutomationIndicators();
    return indicators.filter(indicator => indicator.detected).map(indicator => indicator.type);
  }

  static async reportSecurityIncident(incidentType: string, details: string): Promise<void> {
    await SecurityAuditService.logSecurityEvent(incidentType, details, 'high');
  }

  static generateDeviceFingerprint(): string {
    return SecurityCoreService.generateDeviceFingerprint();
  }

  static performSecurityMaintenance(): void {
    SecurityCoreService.performSecurityMaintenance();
  }
}

// Run maintenance every hour
if (typeof window !== 'undefined') {
  setInterval(MonitoringService.performSecurityMaintenance, 60 * 60 * 1000);
}
