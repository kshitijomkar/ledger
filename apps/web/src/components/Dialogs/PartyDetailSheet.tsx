'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownLeft, Phone, MapPin, Mail, Edit } from 'lucide-react';

interface PartyDetailSheetProps {
  party: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onAddTransaction: (type: 'credit' | 'debit') => void;
}

export function PartyDetailSheet({ party, open, onOpenChange, onEdit, onAddTransaction }: PartyDetailSheetProps) {
  const { api, t, formatCurrency } = useApp();
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (open && party) {
      fetchTransactions();
    }
  }, [open, party]);

  const fetchTransactions = async () => {
    try {
      const res = await api().get(`/transactions?party_id=${party.id}&limit=20`);
      setTransactions(res.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  if (!party) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl">{party.name}</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          <Card className={`${party.balance >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">
                {party.balance > 0 ? t('you_got') : party.balance < 0 ? t('you_gave') : t('settled')}
              </p>
              <p className={`text-3xl font-bold ${party.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(Math.abs(party.balance))}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => onAddTransaction('credit')}>
              <ArrowDownLeft className="w-4 h-4 mr-2" />
              {t('you_got')}
            </Button>
            <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => onAddTransaction('debit')}>
              <ArrowUpRight className="w-4 h-4 mr-2" />
              {t('you_gave')}
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">{t('contact_info')}</h3>
            <div className="space-y-2 text-sm">
              {party.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /> {party.phone}</div>}
              {party.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /> {party.email}</div>}
              {party.address && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /> {party.address}</div>}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">{t('transaction_history')}</h3>
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">{t('no_transactions')}</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{txn.description || t('general')}</p>
                      <p className="text-xs text-muted-foreground">{new Date(txn.date).toLocaleDateString()}</p>
                    </div>
                    <p className={`font-bold text-sm ${txn.transaction_type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {txn.transaction_type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
