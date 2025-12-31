'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Bell,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Truck,
  AlertCircle
} from 'lucide-react';
import { TransactionDialog } from '@/components/Dialogs/TransactionDialog';

interface SummaryData {
  total_credit: number;
  total_debit: number;
  net_balance: number;
  pending_reminders: number;
  customer_count: number;
  supplier_count: number;
  today_credit: number;
  today_debit: number;
  overdue_reminders: number;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  transaction_type: 'credit' | 'debit';
  date: string;
  party_name?: string;
  category?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { api, t, formatCurrency } = useApp();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  const fetchData = async () => {
    try {
      const [summaryRes, txnRes] = await Promise.all([
        api().get('/reports/summary'),
        api().get('/transactions?limit=5'),
      ]);
      setSummary(summaryRes.data);
      setRecentTransactions(txnRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const stats = [
    {
      title: t('total_receivable'),
      value: summary?.total_credit || 0,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      type: 'credit'
    },
    {
      title: t('total_payable'),
      value: summary?.total_debit || 0,
      icon: TrendingDown,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      type: 'debit'
    },
    {
      title: t('net_balance'),
      value: summary?.net_balance || 0,
      icon: Wallet,
      color: (summary?.net_balance || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600',
      bgColor: (summary?.net_balance || 0) >= 0 ? 'bg-emerald-50' : 'bg-rose-50',
      type: (summary?.net_balance || 0) >= 0 ? 'credit' : 'debit'
    },
    {
      title: t('pending_reminders'),
      value: summary?.pending_reminders || 0,
      icon: Bell,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      isCount: true
    }
  ];

  return (
    <div className="space-y-6" data-testid="dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t('dashboard')}</h1>
          <p className="text-muted-foreground">Welcome back! Here's your business overview.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card 
            key={stat.title} 
            className={`stat-card animate-slideUp stagger-${index + 1}`}
            data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className={`text-xl md:text-2xl font-bold mt-1 ${
                  stat.isCount ? '' : stat.type === 'credit' ? 'money-credit' : 'money-debit'
                }`}>
                  {stat.isCount ? stat.value : formatCurrency(stat.value as number)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-interactive" onClick={() => router.push('/customers')}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary?.customer_count || 0}</p>
              <p className="text-sm text-muted-foreground">{t('customers')}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-interactive" onClick={() => router.push('/suppliers')}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-50">
              <Truck className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary?.supplier_count || 0}</p>
              <p className="text-sm text-muted-foreground">{t('suppliers')}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t('today_credit')}</p>
            <p className="text-xl font-bold money-credit mt-1">
              {formatCurrency(summary?.today_credit || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t('today_debit')}</p>
            <p className="text-xl font-bold money-debit mt-1">
              {formatCurrency(summary?.today_debit || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {(summary?.overdue_reminders || 0) > 0 && (
        <Card className="border-rose-200 bg-rose-50/50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <div className="flex-1">
              <p className="font-medium text-rose-900">
                {summary?.overdue_reminders} {t('overdue')} reminders
              </p>
              <p className="text-sm text-rose-700">Some payments are past due date</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-rose-300 text-rose-700 hover:bg-rose-100"
              onClick={() => router.push('/reminders')}
            >
              {t('view')}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg">{t('recent_transactions')}</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/transactions')}
            data-testid="view-all-transactions"
          >
            View All
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {recentTransactions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>{t('no_data')}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowAddTransaction(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('add_transaction')}
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentTransactions.map((txn, index) => (
                <div 
                  key={txn.id} 
                  className={`p-4 flex items-center justify-between hover:bg-muted/50 transition-colors animate-slideUp stagger-${index + 1}`}
                  data-testid={`transaction-${txn.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      txn.transaction_type === 'credit' ? 'bg-emerald-100' : 'bg-rose-100'
                    }`}>
                      {txn.transaction_type === 'credit' ? (
                        <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-rose-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{txn.party_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {txn.description || txn.category || 'Transaction'} · {txn.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      txn.transaction_type === 'credit' ? 'money-credit' : 'money-debit'
                    }`}>
                      {txn.transaction_type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <button 
        className="fab"
        onClick={() => setShowAddTransaction(true)}
        data-testid="add-transaction-fab"
      >
        <Plus className="w-6 h-6" />
      </button>

      <TransactionDialog 
        open={showAddTransaction}
        onOpenChange={setShowAddTransaction}
        onSuccess={fetchData}
      />
    </div>
  );
}
