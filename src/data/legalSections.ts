
import { FileText, Users, Lock, AlertTriangle, Heart, Shield } from 'lucide-react';

export interface LegalPolicy {
  name: string;
  path: string;
  required: boolean;
}

export interface LegalSection {
  title: string;
  icon: any;
  color: string;
  policies: LegalPolicy[];
}

export const legalSections: LegalSection[] = [
  {
    title: "Core Legal Documents",
    icon: FileText,
    color: "blue",
    policies: [
      { name: "Privacy Policy", path: "/legal/privacy", required: true },
      { name: "Terms of Service", path: "/legal/terms", required: true },
      { name: "Community Guidelines", path: "/legal/community", required: true },
      { name: "Cookie Policy", path: "/legal/cookies", required: true },
      { name: "Content Moderation Policy", path: "/legal/moderation", required: true }
    ]
  },
  {
    title: "Safety & Security",
    icon: Shield,
    color: "green",
    policies: [
      { name: "Safety Tips & Guidelines", path: "/legal/safety", required: true },
      { name: "Age Verification Policy", path: "/legal/age-verification", required: true },
      { name: "Identity Verification Policy", path: "/legal/identity-verification", required: true },
      { name: "Romance Scam Prevention", path: "/legal/scam-prevention", required: true },
      { name: "Blocking & Reporting Policy", path: "/legal/reporting", required: true }
    ]
  },
  {
    title: "Data Protection & Privacy",
    icon: Lock,
    color: "purple",
    policies: [
      { name: "GDPR Compliance (EU)", path: "/legal/gdpr", required: true },
      { name: "CCPA Compliance (California)", path: "/legal/ccpa", required: true },
      { name: "Data Retention Policy", path: "/legal/data-retention", required: true },
      { name: "Data Breach Notification", path: "/legal/breach-notification", required: true },
      { name: "Account Deletion Policy", path: "/legal/account-deletion", required: true }
    ]
  },
  {
    title: "Platform Operations",
    icon: Users,
    color: "orange",
    policies: [
      { name: "Photo Verification Guidelines", path: "/legal/photo-verification", required: true },
      { name: "Message Monitoring Policy", path: "/legal/message-monitoring", required: true },
      { name: "Account Suspension Policy", path: "/legal/suspension", required: true },
      { name: "Appeals Process", path: "/legal/appeals", required: true },
      { name: "Inactive Account Policy", path: "/legal/inactive-accounts", required: false }
    ]
  },
  {
    title: "Legal Protection",
    icon: AlertTriangle,
    color: "red",
    policies: [
      { name: "Liability Disclaimer", path: "/legal/liability", required: true },
      { name: "Background Check Disclaimer", path: "/legal/background-check", required: true },
      { name: "Health & Safety Disclaimer", path: "/legal/health-safety", required: true },
      { name: "DMCA Policy", path: "/legal/dmca", required: true },
      { name: "Intellectual Property Policy", path: "/legal/ip", required: false }
    ]
  },
  {
    title: "Financial & Subscriptions",
    icon: Heart,
    color: "pink",
    policies: [
      { name: "Subscription Policy", path: "/legal/subscription", required: false },
      { name: "Refund Policy", path: "/legal/refunds", required: false },
      { name: "Billing Terms", path: "/legal/billing", required: false }
    ]
  }
];
