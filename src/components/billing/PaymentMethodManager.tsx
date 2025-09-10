import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Plus, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  email?: string; // for PayPal
}

export const PaymentMethodManager = () => {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCard, setNewCard] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    type: 'card' as const
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Since we don't have a real payment processor integration,
      // we'll simulate some payment methods
      const mockPaymentMethods: PaymentMethod[] = [
        {
          id: '1',
          type: 'card',
          last4: '4242',
          brand: 'Visa',
          expiryMonth: 12,
          expiryYear: 2025,
          isDefault: true
        },
        {
          id: '2',
          type: 'paypal',
          email: user.email || 'user@example.com',
          isDefault: false
        }
      ];

      setPaymentMethods(mockPaymentMethods);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load payment methods.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate card number (basic validation)
      if (newCard.number.replace(/\s/g, '').length < 13) {
        toast({
          title: "Invalid Card",
          description: "Please enter a valid card number.",
          variant: "destructive"
        });
        return;
      }

      // Create new payment method
      const newMethod: PaymentMethod = {
        id: Math.random().toString(36).substr(2, 9),
        type: newCard.type,
        last4: newCard.number.slice(-4),
        brand: detectCardBrand(newCard.number),
        expiryMonth: parseInt(newCard.expiry.split('/')[0]),
        expiryYear: parseInt('20' + newCard.expiry.split('/')[1]),
        isDefault: paymentMethods.length === 0
      };

      setPaymentMethods([...paymentMethods, newMethod]);
      setShowAddForm(false);
      setNewCard({ number: '', expiry: '', cvc: '', name: '', type: 'card' });

      toast({
        title: "Payment Method Added",
        description: "Your payment method has been successfully added."
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add payment method.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const detectCardBrand = (number: string): string => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'Visa';
    if (cleanNumber.startsWith('5')) return 'Mastercard';
    if (cleanNumber.startsWith('3')) return 'Amex';
    return 'Card';
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setNewCard({ ...newCard, number: formatted });
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setNewCard({ ...newCard, expiry: value });
  };

  const makeDefault = async (methodId: string) => {
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        isDefault: method.id === methodId
      }))
    );
    
    toast({
      title: "Default Updated",
      description: "Your default payment method has been updated."
    });
  };

  const removePaymentMethod = async (methodId: string) => {
    setPaymentMethods(methods => methods.filter(method => method.id !== methodId));
    
    toast({
      title: "Payment Method Removed",
      description: "The payment method has been removed from your account."
    });
  };

  const getCardIcon = (brand: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  return (
    <Card className="bg-slate-800/60 backdrop-blur-xl border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-purple-400" />
          Payment Methods
        </CardTitle>
        <CardDescription className="text-slate-300">
          Manage your payment methods and billing information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-white">Loading payment methods...</div>
          </div>
        ) : (
          <>
            {/* Existing Payment Methods */}
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {method.type === 'paypal' ? '🅿️' : getCardIcon(method.brand || '')}
                      </div>
                      <div>
                        {method.type === 'card' ? (
                          <div>
                            <div className="text-white font-medium">
                              {method.brand} ending in {method.last4}
                            </div>
                            <div className="text-slate-400 text-sm">
                              Expires {method.expiryMonth?.toString().padStart(2, '0')}/{method.expiryYear}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-white font-medium">PayPal</div>
                            <div className="text-slate-400 text-sm">{method.email}</div>
                          </div>
                        )}
                      </div>
                      {method.isDefault && (
                        <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                          Default
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!method.isDefault && (
                        <Button
                          onClick={() => makeDefault(method.id)}
                          variant="outline"
                          size="sm"
                          className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                        >
                          Make Default
                        </Button>
                      )}
                      <Button
                        onClick={() => removePaymentMethod(method.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-500/50 text-red-300 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Payment Method */}
            {showAddForm ? (
              <Card className="bg-slate-700/50 border-slate-600/50">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Add Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddPaymentMethod} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-number" className="text-white">Card Number</Label>
                      <Input
                        id="card-number"
                        value={newCard.number}
                        onChange={handleCardNumberChange}
                        placeholder="1234 5678 9012 3456"
                        className="bg-slate-600 border-slate-500 text-white"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry" className="text-white">Expiry Date</Label>
                        <Input
                          id="expiry"
                          value={newCard.expiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="bg-slate-600 border-slate-500 text-white"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvc" className="text-white">CVC</Label>
                        <Input
                          id="cvc"
                          value={newCard.cvc}
                          onChange={(e) => setNewCard({ ...newCard, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                          placeholder="123"
                          className="bg-slate-600 border-slate-500 text-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="card-name" className="text-white">Cardholder Name</Label>
                      <Input
                        id="card-name"
                        value={newCard.name}
                        onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                        placeholder="John Doe"
                        className="bg-slate-600 border-slate-500 text-white"
                        required
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        Add Payment Method
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddForm(false)}
                        className="border-slate-500 text-slate-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Button
                onClick={() => setShowAddForm(true)}
                variant="outline"
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            )}

            {/* Security Notice */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h5 className="text-blue-400 font-medium">Secure Payment Processing</h5>
                  <p className="text-blue-300 text-sm mt-1">
                    Your payment information is encrypted and securely processed. We never store your full card details.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentMethodManager;