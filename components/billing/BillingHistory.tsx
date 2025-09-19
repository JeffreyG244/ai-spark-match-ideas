import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Download, Calendar, CreditCard, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface BillingTransaction {
  id: string;
  date: string;
  amount: number;
  currency: string;
  description: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  invoiceNumber: string;
  paymentMethod: string;
  downloadUrl?: string;
}

export const BillingHistory = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<BillingTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all, last3months, last6months, lastyear

  useEffect(() => {
    loadBillingHistory();
  }, []);

  const loadBillingHistory = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Since we don't have a real billing system, we'll simulate transaction history
      const mockTransactions: BillingTransaction[] = [
        {
          id: 'txn_1234567890',
          date: new Date().toISOString(),
          amount: 49.99,
          currency: 'USD',
          description: 'Executive Professional - Monthly Subscription',
          status: 'paid',
          invoiceNumber: 'INV-2024-001',
          paymentMethod: 'Visa •••• 4242'
        },
        {
          id: 'txn_1234567889',
          date: new Date(Date.now() - 86400000 * 30).toISOString(),
          amount: 49.99,
          currency: 'USD',
          description: 'Executive Professional - Monthly Subscription',
          status: 'paid',
          invoiceNumber: 'INV-2024-002',
          paymentMethod: 'Visa •••• 4242'
        },
        {
          id: 'txn_1234567888',
          date: new Date(Date.now() - 86400000 * 60).toISOString(),
          amount: 49.99,
          currency: 'USD',
          description: 'Executive Professional - Monthly Subscription',
          status: 'paid',
          invoiceNumber: 'INV-2024-003',
          paymentMethod: 'Visa •••• 4242'
        },
        {
          id: 'txn_1234567887',
          date: new Date(Date.now() - 86400000 * 90).toISOString(),
          amount: 49.99,
          currency: 'USD',
          description: 'Executive Professional - Upgrade',
          status: 'paid',
          invoiceNumber: 'INV-2024-004',
          paymentMethod: 'PayPal'
        },
        {
          id: 'txn_1234567886',
          date: new Date(Date.now() - 86400000 * 120).toISOString(),
          amount: 19.99,
          currency: 'USD',
          description: 'Premium Subscription - Monthly',
          status: 'refunded',
          invoiceNumber: 'INV-2024-005',
          paymentMethod: 'Visa •••• 4242'
        }
      ];

      setTransactions(mockTransactions);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load billing history.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      case 'refunded':
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <AlertCircle className="w-3 h-3 mr-1" />
            Refunded
          </Badge>
        );
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Unknown</Badge>;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  const downloadInvoice = async (transaction: BillingTransaction) => {
    // Simulate invoice download
    const invoiceContent = `
LUVLANG PROFESSIONAL DATING

Invoice ${transaction.invoiceNumber}
Date: ${new Date(transaction.date).toLocaleDateString()}

Description: ${transaction.description}
Amount: ${formatAmount(transaction.amount, transaction.currency)}
Payment Method: ${transaction.paymentMethod}
Status: ${transaction.status.toUpperCase()}

Transaction ID: ${transaction.id}

Thank you for your business!
`;

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${transaction.invoiceNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Invoice Downloaded",
      description: `Invoice ${transaction.invoiceNumber} has been downloaded.`
    });
  };

  const filterTransactions = () => {
    let filtered = transactions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (dateFilter) {
        case 'last3months':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case 'last6months':
          cutoffDate.setMonth(now.getMonth() - 6);
          break;
        case 'lastyear':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(transaction =>
        new Date(transaction.date) >= cutoffDate
      );
    }

    return filtered;
  };

  const calculateTotal = () => {
    const filtered = filterTransactions();
    return filtered
      .filter(t => t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <Card className="bg-slate-800/60 backdrop-blur-xl border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-400" />
          Billing History
        </CardTitle>
        <CardDescription className="text-slate-300">
          View and download your payment history and invoices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white"
            >
              <option value="all">All time</option>
              <option value="last3months">Last 3 months</option>
              <option value="last6months">Last 6 months</option>
              <option value="lastyear">Last year</option>
            </select>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Total Spent</h3>
              <p className="text-slate-300 text-sm">
                {filterTransactions().length} transactions
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {formatAmount(calculateTotal(), 'USD')}
              </div>
              <div className="text-slate-400 text-sm">
                {dateFilter === 'all' ? 'All time' : dateFilter.replace(/([a-z])([0-9])/g, '$1 $2')}
              </div>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-white">Loading billing history...</div>
          </div>
        ) : filterTransactions().length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <div className="text-slate-300">
              {searchTerm || dateFilter !== 'all' ? 'No transactions match your filters' : 'No billing history found'}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filterTransactions().map((transaction) => (
              <div
                key={transaction.id}
                className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CreditCard className="w-4 h-4 text-purple-400" />
                      <h4 className="text-white font-medium">{transaction.description}</h4>
                      {getStatusBadge(transaction.status)}
                    </div>
                    <div className="text-slate-300 text-sm space-y-1">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                        <div>Invoice: {transaction.invoiceNumber}</div>
                        <div>{transaction.paymentMethod}</div>
                      </div>
                      <div className="text-slate-400 text-xs font-mono">
                        Transaction ID: {transaction.id}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-3">
                    <div className="text-xl font-bold text-white">
                      {transaction.status === 'refunded' && '-'}
                      {formatAmount(transaction.amount, transaction.currency)}
                    </div>
                    <Button
                      onClick={() => downloadInvoice(transaction)}
                      variant="outline"
                      size="sm"
                      className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Invoice
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Export All */}
        {filterTransactions().length > 0 && (
          <div className="text-center pt-4">
            <Button
              onClick={() => {
                const csvContent = [
                  'Date,Invoice,Description,Amount,Currency,Status,Payment Method,Transaction ID',
                  ...filterTransactions().map(t => 
                    `${new Date(t.date).toLocaleDateString()},${t.invoiceNumber},"${t.description}",${t.amount},${t.currency},${t.status},"${t.paymentMethod}",${t.id}`
                  )
                ].join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `luvlang-billing-history-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                toast({
                  title: "Export Complete",
                  description: "Your billing history has been exported to CSV."
                });
              }}
              variant="outline"
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
            >
              <Download className="w-4 h-4 mr-2" />
              Export to CSV
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BillingHistory;