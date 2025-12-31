'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, Search, User, Phone, MoreVertical, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PartyDialog } from '@/components/Dialogs/PartyDialog';
import { PartyDetailSheet } from '@/components/Dialogs/PartyDetailSheet';
import { TransactionDialog } from '@/components/Dialogs/TransactionDialog';
import { toast } from 'sonner';

export default function Customers() {
  const { api, t, formatCurrency } = useApp();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editParty, setEditParty] = useState<any>(null);
  const [selectedParty, setSelectedParty] = useState<any>(null);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [transactionType, setTransactionType] = useState<'credit' | 'debit'>('credit');

  const fetchCustomers = async () => {
    try {
      const res = await api().get('/parties?party_type=customer');
      setCustomers(res.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('are_you_sure'))) return;
    try {
      await api().delete(`/parties/${id}`);
      toast.success(t('success'), { description: 'Customer deleted' });
      fetchCustomers();
    } catch (error) {
      toast.error(t('error'), { description: 'Failed to delete customer' });
    }
  };

  const handleAddTransaction = (party: any, type: 'credit' | 'debit') => {
    setSelectedParty(party);
    setTransactionType(type);
    setShowTransactionDialog(true);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  );

  const totalReceivable = customers.reduce((sum, c) => sum + (c.balance > 0 ? c.balance : 0), 0);
  const totalPayable = customers.reduce((sum, c) => sum + (c.balance < 0 ? Math.abs(c.balance) : 0), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="customers-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" role="heading" aria-level={1}>{t('customers')}</h1>
          <p className="text-muted-foreground" aria-live="polite">{customers.length} total customers</p>
        </div>
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="rounded-full"
          data-testid="add-customer-btn"
          aria-label={t('add_customer')}
        >
          <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
          {t('add_customer')}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Receivable</p>
            <p className="text-xl font-bold money-credit mt-1">{formatCurrency(totalReceivable)}</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Payable</p>
            <p className="text-xl font-bold money-debit mt-1">{formatCurrency(totalPayable)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder={t('search_parties')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12"
          data-testid="search-customers"
        />
      </div>

      {filteredCustomers.length === 0 ? (
        <Card className="p-8 text-center">
          <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t('no_customers')}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredCustomers.map((customer, index) => (
            <Card key={customer.id} className="card-interactive animate-slideUp" style={{ animationDelay: `${index * 0.05}s` }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setSelectedParty(customer)}>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">{customer.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{customer.name}</p>
                      {customer.phone && <p className="text-sm text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{customer.phone}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right mr-2">
                      <p className={`font-bold tabular-nums ${customer.balance > 0 ? 'money-credit' : customer.balance < 0 ? 'money-debit' : 'money-neutral'}`}>
                        {formatCurrency(Math.abs(customer.balance))}
                      </p>
                      <p className="text-xs text-muted-foreground">{customer.balance > 0 ? t('you_got') : customer.balance < 0 ? t('you_gave') : 'Settled'}</p>
                    </div>

                    <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50" onClick={(e) => { e.stopPropagation(); handleAddTransaction(customer, 'credit'); }}>
                      <ArrowDownLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600 hover:bg-rose-50" onClick={(e) => { e.stopPropagation(); handleAddTransaction(customer, 'debit'); }}>
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedParty(customer)}>{t('view')}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditParty(customer)}>{t('edit')}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(customer.id)} className="text-rose-600">{t('delete')}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PartyDialog 
        open={showAddDialog || !!editParty}
        onOpenChange={(open: boolean) => { if (!open) { setShowAddDialog(false); setEditParty(null); } }}
        party={editParty}
        partyType="customer"
        onSuccess={() => { setShowAddDialog(false); setEditParty(null); fetchCustomers(); }}
      />

      <PartyDetailSheet
        party={selectedParty}
        open={!!selectedParty && !showTransactionDialog}
        onOpenChange={(open: boolean) => !open && setSelectedParty(null)}
        onEdit={() => { setEditParty(selectedParty); setSelectedParty(null); }}
        onAddTransaction={(type: any) => handleAddTransaction(selectedParty, type)}
      />

      <TransactionDialog
        open={showTransactionDialog}
        onOpenChange={setShowTransactionDialog}
        party={selectedParty}
        defaultType={transactionType}
        onSuccess={() => { setShowTransactionDialog(false); fetchCustomers(); }}
      />

      <button 
        className="fab"
        onClick={() => setShowAddDialog(true)}
        data-testid="add-customer-fab"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
