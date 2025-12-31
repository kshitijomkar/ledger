'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Loader2, Calendar as CalendarIcon, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  party?: any;
  defaultType?: 'credit' | 'debit';
  onSuccess: () => void;
}

export function TransactionDialog({ open, onOpenChange, party, defaultType = 'credit', onSuccess }: TransactionDialogProps) {
  const { api, t } = useApp();
  const [loading, setLoading] = useState(false);
  const [parties, setParties] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    party_id: '',
    amount: '',
    transaction_type: defaultType,
    description: '',
    date: new Date(),
    category: ''
  });

  const fetchParties = useCallback(async () => {
    try {
      const res = await api().get('/parties');
      setParties(res.data);
    } catch (error) {
      console.error('Error fetching parties:', error);
    }
  }, [api]);

  useEffect(() => {
    if (open) {
      fetchParties();
      setFormData(prev => ({
        ...prev,
        party_id: party?.id || '',
        transaction_type: defaultType,
        amount: '',
        description: '',
        date: new Date(),
        category: ''
      }));
    }
  }, [open, party, defaultType, fetchParties]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.party_id) {
      toast.error(t('error'), { description: 'Please select a party' });
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error(t('error'), { description: 'Please enter a valid amount' });
      return;
    }

    setLoading(true);
    try {
      await api().post('/transactions', {
        party_id: formData.party_id,
        amount: parseFloat(formData.amount),
        transaction_type: formData.transaction_type,
        description: formData.description,
        date: format(formData.date, 'yyyy-MM-dd'),
        category: formData.category || null
      });
      toast.success(t('success'), { description: 'Transaction added' });
      onSuccess();
    } catch (error: any) {
      toast.error(t('error'), { description: error.response?.data?.detail || 'Failed to add transaction' });
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'sales', label: 'Sales' },
    { value: 'purchase', label: 'Purchase' },
    { value: 'expense', label: 'Expense' },
    { value: 'salary', label: 'Salary' },
    { value: 'rent', label: 'Rent' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'transport', label: 'Transport' },
    { value: 'services', label: 'Services' },
    { value: 'loan', label: 'Loan' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('add_transaction')}</DialogTitle>
          <DialogDescription>
            {t('transaction_dialog_description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={formData.transaction_type === 'credit' ? 'default' : 'outline'}
              className={`h-16 flex flex-col gap-1 ${
                formData.transaction_type === 'credit' 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : 'hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'
              }`}
              onClick={() => setFormData({ ...formData, transaction_type: 'credit' })}
              data-testid="txn-type-credit"
            >
              <ArrowDownLeft className="w-5 h-5" />
              <span>{t('you_got')}</span>
            </Button>
            <Button
              type="button"
              variant={formData.transaction_type === 'debit' ? 'default' : 'outline'}
              className={`h-16 flex flex-col gap-1 ${
                formData.transaction_type === 'debit' 
                  ? 'bg-rose-600 hover:bg-rose-700' 
                  : 'hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
              }`}
              onClick={() => setFormData({ ...formData, transaction_type: 'debit' })}
              data-testid="txn-type-debit"
            >
              <ArrowUpRight className="w-5 h-5" />
              <span>{t('you_gave')}</span>
            </Button>
          </div>

          {/* Party Selection */}
          <div className="space-y-2">
            <Label>{t('select_party')} *</Label>
            <Select
              value={formData.party_id}
              onValueChange={(value) => setFormData({ ...formData, party_id: value })}
              disabled={!!party}
            >
              <SelectTrigger data-testid="txn-party-select">
                <SelectValue placeholder={t('select_party')} />
              </SelectTrigger>
              <SelectContent>
                {parties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.party_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">{t('amount')} *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="pl-8 text-lg font-mono"
                required
                data-testid="txn-amount-input"
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>{t('date')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start" data-testid="txn-date-picker">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {format(formData.date, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => date && setFormData({ ...formData, date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>{t('category')}</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger data-testid="txn-category-select">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter details"
              className="resize-none"
              data-testid="txn-description-input"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button 
              type="submit" 
              className={`flex-1 ${
                formData.transaction_type === 'credit' 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
              disabled={loading}
              data-testid="txn-submit"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('loading')}
                </>
              ) : (
                t('save')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
