import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { MonitoringService } from '@/services/security/MonitoringService';
import { SecurityAuditService } from '@/services/security/SecurityAuditService';
import { SecurityCoreService } from '@/services/security/SecurityCoreService';
export const useSecurityMonitoring = () => {
    const { user } = useAuth();
    const [securityStatus, setSecurityStatus] = useState({
        sessionValid: true,
        deviceTrusted: true,
        lastSecurityCheck: new Date(),
        riskLevel: 'low',
        securityScore: 85
    });
    const performSecurityCheck = useCallback(async () => {
        if (!user) {
            setSecurityStatus(prev => ({
                ...prev,
                sessionValid: false,
                lastSecurityCheck: new Date(),
                riskLevel: 'medium',
                securityScore: 50
            }));
            return;
        }
        try {
            const automationIndicators = MonitoringService.detectAutomationIndicators();
            const deviceFingerprint = SecurityCoreService.generateDeviceFingerprint();
            const knownDevices = JSON.parse(localStorage.getItem(`known_devices_${user.id}`) || '[]');
            const isKnownDevice = knownDevices.includes(deviceFingerprint);
            if (!isKnownDevice) {
                SecurityAuditService.logSecurityEvent('new_device_detected', `User ${user.id} using new or unrecognized device`, 'medium');
                if (knownDevices.length < 10) {
                    knownDevices.push(deviceFingerprint);
                    localStorage.setItem(`known_devices_${user.id}`, JSON.stringify(knownDevices));
                }
            }
            let suspiciousActivityDetected = false;
            let securityScore = 85;
            if (!navigator.cookieEnabled) {
                suspiciousActivityDetected = true;
                securityScore -= 20;
                SecurityAuditService.logSecurityEvent('cookies_disabled', 'User has cookies disabled which may indicate privacy mode or spoofing', 'medium');
            }
            if (automationIndicators.length > 0) {
                suspiciousActivityDetected = true;
                securityScore -= 15 * automationIndicators.length;
                SecurityAuditService.logSecurityEvent('automation_indicators', `Potential automation detected: ${automationIndicators.join(', ')}`, 'high');
            }
            let riskLevel = 'low';
            if (suspiciousActivityDetected || !isKnownDevice) {
                riskLevel = 'medium';
                securityScore = Math.max(0, securityScore - 25);
            }
            setSecurityStatus({
                sessionValid: true,
                deviceTrusted: isKnownDevice,
                lastSecurityCheck: new Date(),
                riskLevel,
                securityScore: Math.max(0, Math.min(100, securityScore))
            });
        }
        catch (error) {
            console.error('Security check error:', error);
            SecurityAuditService.logSecurityEvent('security_check_failed', `Security check failed: ${error}`, 'high');
            setSecurityStatus(prev => ({
                ...prev,
                lastSecurityCheck: new Date(),
                riskLevel: 'high',
                securityScore: Math.max(0, prev.securityScore - 30)
            }));
        }
    }, [user]);
    useEffect(() => {
        if (!user)
            return;
        performSecurityCheck();
        const securityInterval = setInterval(performSecurityCheck, 5 * 60 * 1000);
        return () => {
            clearInterval(securityInterval);
        };
    }, [user, performSecurityCheck]);
    const reportSecurityIncident = async (incidentType, details) => {
        SecurityAuditService.logSecurityEvent(incidentType, details, 'high');
        setSecurityStatus(prev => ({
            ...prev,
            riskLevel: 'high',
            securityScore: Math.max(0, prev.securityScore - 25)
        }));
    };
    const getDeviceFingerprint = () => {
        return SecurityCoreService.generateDeviceFingerprint();
    };
    return {
        securityStatus,
        reportSecurityIncident,
        getDeviceFingerprint,
        performSecurityCheck
    };
};
