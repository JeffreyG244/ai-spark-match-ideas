
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CheckCircle } from 'lucide-react';

const DeploymentGuide = () => {
  const steps = [
    {
      title: "Configure PayPal Hosted Buttons",
      status: "critical",
      tasks: [
        "Log into your PayPal Business account",
        "Go to Tools > PayPal Buttons",
        "Create hosted buttons for each plan/billing cycle",
        "Copy the button IDs and replace placeholders in usePayPalCheckout.ts",
        "Configure webhook URL in PayPal to point to your deployed webhook function"
      ]
    },
    {
      title: "Set Up PayPal Webhooks",
      status: "critical", 
      tasks: [
        "In PayPal Developer Dashboard, configure webhook endpoint",
        "Point to: https://your-project.supabase.co/functions/v1/paypal-webhook",
        "Enable events: PAYMENT.SALE.COMPLETED, BILLING.SUBSCRIPTION.ACTIVATED, BILLING.SUBSCRIPTION.CANCELLED",
        "Complete webhook signature verification in the webhook handler"
      ]
    },
    {
      title: "Final Testing",
      status: "recommended",
      tasks: [
        "Test complete user registration flow",
        "Test plan upgrades with real PayPal transactions",
        "Verify webhook processing works correctly",
        "Test subscription management functionality",
        "Run security and performance audits"
      ]
    },
    {
      title: "Deploy to Production",
      status: "ready",
      tasks: [
        "Click the Publish button in Lovable",
        "Configure custom domain if needed",
        "Set up monitoring and error tracking",
        "Monitor initial user interactions"
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'recommended': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Deployment Guide</CardTitle>
          <p className="text-gray-600">Follow these steps to complete your production deployment</p>
        </CardHeader>
      </Card>

      {steps.map((step, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {index + 1}. {step.title}
              </CardTitle>
              <Badge className={getStatusColor(step.status)}>
                {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {step.tasks.map((task, taskIndex) => (
                <li key={taskIndex} className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{task}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <ExternalLink className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Ready to deploy?</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Once you've completed the critical steps above, your application will be ready for production deployment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeploymentGuide;
