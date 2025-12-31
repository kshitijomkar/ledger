'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, Search, Truck, Phone, MoreVertical, ArrowUpRight, ArrowDownLeft
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

export default function Suppliers() {
  const { api, t, formatCurrency } = useApp();
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editParty, setEditParty] = useState<any>(null);
  const [selectedParty, setSelectedParty] = useState<any>(null);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [transactionType, setTransactionType] = useState<'credit' | 'debit'>('debit');

  const fetchSuppliers = async () => {
    try {
      const res = await api().get('/parties?party_type=supplier');
      setSuppliers(res.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('are_you_sure'))) return;
    try {
      await api().delete(`/parties/${id}`);
      toast.success(t('success'), { description: 'Supplier deleted' });
      fetchSuppliers();
    } catch (error) {
      toast.error(t('error'), { description: 'Failed to delete supplier' });
    }
  };

  const handleAddTransaction = (party: any, type: 'credit' | 'debit') => {
    setSelectedParty(party);
    setTransactionType(type);
    setShowTransactionDialog(true);
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone?.includes(searchQuery)
  );

  const totalPayable = suppliers.reduce((sum, s) => sum + (s.balance < 0 ? Math.abs(s.balance) : 0), 0);
  const totalReceivable = suppliers.reduce((sum, s) => sum + (s.balance > 0 ? s.balance : 0), 0);

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
    <div className="space-y-6" data-testid="suppliers-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" role="heading" aria-level={1}>{t('suppliers')}</h1>
          <p className="text-muted-foreground" aria-live="polite">{suppliers.length} total suppliers</p>
        </div>
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="rounded-full"
          data-testid="add-supplier-btn"
          aria-label={t('add_supplier')}
        >
          <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
          {t('add_supplier')}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Payable</p>
            <p className="text-xl font-bold money-debit mt-1">{formatCurrency(totalPayable)}</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Receivable</p>
            <p className="text-xl font-bold money-credit mt-1">{formatCurrency(totalReceivable)}</p>
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
          data-testid="search-suppliers"
        />
      </div>

      {filteredSuppliers.length === 0 ? (
        <Card className="p-8 text-center">
          <Truck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t('no_suppliers')}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSuppliers.map((supplier, index) => (
            <Card key={supplier.id} className="card-interactive animate-slideUp" style={{ animationDelay: `${index * 0.05}s` }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setSelectedParty(supplier)}>
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{supplier.name}</p>
                      {supplier.phone && <p className="text-sm text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{supplier.phone}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right mr-2">
                      <p className={`font-bold tabular-nums ${supplier.balance > 0 ? 'money-credit' : supplier.balance < 0 ? 'money-debit' : 'money-neutral'}`}>
                        {formatCurrency(Math.abs(supplier.balance))}
                      </p>
                      <p className="text-xs text-muted-foreground">{supplier.balance > 0 ? t('you_got') : supplier.balance < 0 ? t('you_gave') : 'Settled'}</p>
                    </div>

                    <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50" onClick={(e) => { e.stopPropagation(); handleAddTransaction(supplier, 'credit'); }}>
                      <ArrowDownLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600 hover:bg-rose-50" onClick={(e) => { e.stopPropagation(); handleAddTransaction(supplier, 'debit'); }}>
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedParty(supplier)}>{t('view')}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditParty(supplier)}>{t('edit')}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(supplier.id)} className="text-rose-600">{t('delete')}</DropdownMenuItem>
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
        partyType="supplier"
        onSuccess={() => { setShowAddDialog(false); setEditParty(null); fetchSuppliers(); }}
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
        onSuccess={() => { setShowTransactionDialog(false); fetchSuppliers(); }}
      />

      <button 
        className="fab"
        onClick={() => setShowAddDialog(true)}
        data-testid="add-supplier-fab"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
