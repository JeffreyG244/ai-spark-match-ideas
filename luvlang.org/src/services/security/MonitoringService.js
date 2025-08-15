import { SecurityCoreService } from './SecurityCoreService';
export class MonitoringService {
    static detectAutomationIndicators() {
        const indicators = SecurityCoreService.detectAutomationIndicators();
        return indicators.filter(indicator => indicator.detected).map(indicator => indicator.type);
    }
    static async reportSecurityIncident(incidentType, details) {
        await SecurityCoreService.logSecurityEvent(incidentType, { message: details }, 'high');
    }
    static generateDeviceFingerprint() {
        return SecurityCoreService.generateDeviceFingerprint();
    }
    static performSecurityMaintenance() {
        SecurityCoreService.performSecurityMaintenance();
    }
}
// Run maintenance every hour
if (typeof window !== 'undefined') {
    setInterval(MonitoringService.performSecurityMaintenance, 60 * 60 * 1000);
}
