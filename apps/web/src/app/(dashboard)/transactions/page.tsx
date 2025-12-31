'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { 
  Plus, ArrowUpRight, ArrowDownLeft, 
  Filter, X, Trash2, Calendar as CalendarIcon
} from 'lucide-react';
import { TransactionDialog } from '@/components/Dialogs/TransactionDialog';
import { toast } from 'sonner';

export default function Transactions() {
  const { api, t, formatCurrency } = useApp();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filters, setFilters] = useState({
    party_id: '',
    transaction_type: '',
    start_date: null as Date | null,
    end_date: null as Date | null
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.party_id) params.append('party_id', filters.party_id);
      if (filters.transaction_type) params.append('transaction_type', filters.transaction_type);
      if (filters.start_date) params.append('start_date', format(filters.start_date, 'yyyy-MM-dd'));
      if (filters.end_date) params.append('end_date', format(filters.end_date, 'yyyy-MM-dd'));

      const [txnRes, partiesRes] = await Promise.all([
        api().get(`/transactions?${params.toString()}`),
        api().get('/parties')
      ]);
      setTransactions(txnRes.data);
      setParties(partiesRes.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('are_you_sure'))) return;
    try {
      await api().delete(`/transactions/${id}`);
      toast.success(t('success'), { description: 'Transaction deleted' });
      fetchData();
    } catch (error) {
      toast.error(t('error'), { description: 'Failed to delete transaction' });
    }
  };

  const clearFilters = () => {
    setFilters({
      party_id: '',
      transaction_type: '',
      start_date: null,
      end_date: null
    });
  };

  const hasActiveFilters = filters.party_id || filters.transaction_type || filters.start_date || filters.end_date;

  const totalCredit = transactions
    .filter(t => t.transaction_type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebit = transactions
    .filter(t => t.transaction_type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="transactions-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" role="heading" aria-level={1}>{t('transactions')}</h1>
          <p className="text-muted-foreground" aria-live="polite">{transactions.length} transactions</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={showFilters ? "secondary" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            data-testid="filter-btn"
            aria-label={t('filter_by_date')}
            aria-pressed={showFilters}
          >
            <Filter className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('filter_by_date')}
            {hasActiveFilters && (
              <span className="ml-2 w-2 h-2 rounded-full bg-primary" aria-label="Active filters" />
            )}
          </Button>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="rounded-full"
            data-testid="add-transaction-btn"
            aria-label={t('add_transaction')}
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('add_transaction')}
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="animate-in slide-in-from-top-2 duration-300">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <Select
                value={filters.party_id}
                onValueChange={(value) => setFilters({ ...filters, party_id: value })}
              >
                <SelectTrigger className="w-[200px]" data-testid="filter-party">
                  <SelectValue placeholder={t('select_party')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('all_parties')}</SelectItem>
                  {parties.map((party) => (
                    <SelectItem key={party.id} value={party.id}>
                      {party.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.transaction_type}
                onValueChange={(value) => setFilters({ ...filters, transaction_type: value })}
              >
                <SelectTrigger className="w-[150px]" data-testid="filter-type">
                  <SelectValue placeholder={t('transaction_type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('all_types')}</SelectItem>
                  <SelectItem value="credit">{t('credit')}</SelectItem>
                  <SelectItem value="debit">{t('debit')}</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[150px] justify-start" data-testid="filter-start-date">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {filters.start_date ? format(filters.start_date, 'PP') : t('start_date')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.start_date || undefined}
                    onSelect={(date) => setFilters({ ...filters, start_date: date || null })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[150px] justify-start" data-testid="filter-end-date">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {filters.end_date ? format(filters.end_date, 'PP') : t('end_date')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.end_date || undefined}
                    onSelect={(date) => setFilters({ ...filters, end_date: date || null })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} data-testid="clear-filters">
                  <X className="w-4 h-4 mr-2" />
                  {t('clear')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t('credit')}</p>
            <p className="text-xl font-bold money-credit mt-1">{formatCurrency(totalCredit)}</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t('debit')}</p>
            <p className="text-xl font-bold money-debit mt-1">{formatCurrency(totalDebit)}</p>
          </CardContent>
        </Card>
      </div>

      {transactions.length === 0 ? (
        <Card className="p-8 text-center animate-fadeIn">
          <p className="text-muted-foreground">{t('no_data')}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {transactions.map((txn, index) => (
            <Card key={txn.id} className="card-interactive animate-slideUp" style={{ animationDelay: `${index * 0.05}s` }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      txn.transaction_type === 'credit' ? 'bg-emerald-100' : 'bg-rose-100'
                    }`}>
                      {txn.transaction_type === 'credit' ? (
                        <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-rose-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{txn.party_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {txn.description || txn.category || 'Transaction'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(txn.date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-lg font-bold tabular-nums ${
                        txn.transaction_type === 'credit' ? 'money-credit' : 'money-debit'
                      }`}>
                        {txn.transaction_type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-rose-600"
                      onClick={() => handleDelete(txn.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TransactionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => {
          setShowAddDialog(false);
          fetchData();
        }}
      />

      <button 
        className="fab"
        onClick={() => setShowAddDialog(true)}
        data-testid="add-transaction-fab"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
