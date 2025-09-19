import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Crown, Calendar, CreditCard, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMembershipBadge } from '@/hooks/useMembershipBadge';

interface Subscription {
  id: string;
  plan: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
}

export const SubscriptionManager = () => {
  const { toast } = useToast();
  const { membershipLevel } = useMembershipBadge();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Since we don't have a real subscription system integrated,
      // we'll simulate based on membership level
      if (membershipLevel && membershipLevel !== 'basic') {
        const mockSubscription: Subscription = {
          id: 'sub_' + Math.random().toString(36).substr(2, 9),
          plan: membershipLevel === 'c_suite' ? 'C-Suite Executive' : 
                membershipLevel === 'executive' ? 'Executive Professional' : 'Premium',
          status: 'active',
          currentPeriodStart: new Date(Date.now() - 86400000 * 15).toISOString(),
          currentPeriodEnd: new Date(Date.now() + 86400000 * 15).toISOString(),
          cancelAtPeriodEnd: false,
          amount: membershipLevel === 'c_suite' ? 99.99 : 
                  membershipLevel === 'executive' ? 49.99 : 19.99,
          currency: 'USD',
          interval: 'month'
        };
        setSubscription(mockSubscription);
      } else {
        setSubscription(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load subscription information.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Cancelled</Badge>;
      case 'past_due':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Past Due</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Trial</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Unknown</Badge>;
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    setIsLoading(true);
    try {
      // In a real implementation, this would call your payment processor
      const updatedSubscription = {
        ...subscription,
        cancelAtPeriodEnd: true
      };
      setSubscription(updatedSubscription);
      setShowCancelConfirm(false);

      toast({
        title: "Subscription Cancelled",
        description: `Your subscription will end on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}. You'll retain access until then.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscription) return;
    
    setIsLoading(true);
    try {
      const updatedSubscription = {
        ...subscription,
        cancelAtPeriodEnd: false
      };
      setSubscription(updatedSubscription);

      toast({
        title: "Subscription Reactivated",
        description: "Your subscription will continue to renew automatically."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reactivate subscription. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  return (
    <Card className="bg-slate-800/60 backdrop-blur-xl border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-400" />
          Subscription Management
        </CardTitle>
        <CardDescription className="text-slate-300">
          View and manage your membership subscription
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-white">Loading subscription...</div>
          </div>
        ) : !subscription ? (
          <div className="text-center py-8 space-y-4">
            <Crown className="w-12 h-12 text-slate-400 mx-auto" />
            <div>
              <h3 className="text-white font-medium mb-2">No Active Subscription</h3>
              <p className="text-slate-300 text-sm mb-4">
                You're currently on the free Basic plan. Upgrade to unlock premium features.
              </p>
              <Button
                onClick={() => window.location.href = '/membership'}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Subscription */}
            <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600/50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Crown className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-semibold text-white">{subscription.plan}</h3>
                    {getStatusBadge(subscription.status)}
                  </div>
                  <p className="text-slate-300">
                    {formatAmount(subscription.amount, subscription.currency)} / {subscription.interval}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-sm">Subscription ID</div>
                  <div className="text-white font-mono text-sm">{subscription.id}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-600/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span className="text-white font-medium">Current Period</span>
                  </div>
                  <div className="text-slate-300 text-sm">
                    {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </div>
                </div>

                <div className="bg-slate-600/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-purple-400" />
                    <span className="text-white font-medium">Next Billing</span>
                  </div>
                  <div className="text-slate-300 text-sm">
                    {subscription.cancelAtPeriodEnd 
                      ? 'Cancelled - access ends ' + new Date(subscription.currentPeriodEnd).toLocaleDateString()
                      : new Date(subscription.currentPeriodEnd).toLocaleDateString()
                    }
                  </div>
                </div>
              </div>

              {subscription.cancelAtPeriodEnd && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                    <div>
                      <h5 className="text-amber-400 font-medium">Subscription Cancelled</h5>
                      <p className="text-amber-300 text-sm mt-1">
                        Your subscription will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}. 
                        You'll retain access to all features until then.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => window.location.href = '/membership'}
                  variant="outline"
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 flex-1"
                >
                  Change Plan
                </Button>
                
                {subscription.cancelAtPeriodEnd ? (
                  <Button
                    onClick={handleReactivateSubscription}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Reactivate
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowCancelConfirm(true)}
                    variant="outline"
                    className="border-red-500/50 text-red-300 hover:bg-red-500/20 flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </div>

            {/* Cancel Confirmation */}
            {showCancelConfirm && (
              <Card className="bg-red-500/10 border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Cancel Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-red-300">
                    <p className="mb-2">Are you sure you want to cancel your subscription?</p>
                    <ul className="text-sm space-y-1 mb-4">
                      <li>• You'll lose access to premium features at the end of your billing period</li>
                      <li>• Your account will revert to the Basic plan</li>
                      <li>• You can reactivate anytime before the cancellation takes effect</li>
                    </ul>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleCancelSubscription}
                      disabled={isLoading}
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Yes, Cancel Subscription
                    </Button>
                    <Button
                      onClick={() => setShowCancelConfirm(false)}
                      variant="outline"
                      className="border-slate-500 text-slate-300"
                    >
                      Keep Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionManager;