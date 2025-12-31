'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface PartyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  party: any;
  partyType: 'customer' | 'supplier';
  onSuccess: () => void;
}

export function PartyDialog({ open, onOpenChange, party, partyType, onSuccess }: PartyDialogProps) {
  const { api, t } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    opening_balance: '',
    balance_type: 'none',
    party_type: partyType
  });

  useEffect(() => {
    if (party) {
      setFormData({
        name: party.name || '',
        phone: party.phone || '',
        email: party.email || '',
        address: party.address || '',
        notes: party.notes || '',
        opening_balance: '',
        balance_type: 'none',
        party_type: party.party_type || partyType
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
        opening_balance: '',
        balance_type: 'none',
        party_type: partyType
      });
    }
  }, [party, partyType, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error(t('error'), { description: 'Name is required' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        opening_balance: parseFloat(formData.opening_balance) || 0,
        party_type: partyType
      };

      if (party) {
        await api().put(`/parties/${party.id}`, payload);
        toast.success(t('success'), { description: `${partyType === 'customer' ? 'Customer' : 'Supplier'} updated` });
      } else {
        await api().post('/parties', payload);
        toast.success(t('success'), { description: `${partyType === 'customer' ? 'Customer' : 'Supplier'} added` });
      }
      onSuccess();
    } catch (error: any) {
      toast.error(t('error'), { description: error.response?.data?.detail || 'Failed to save' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {party ? t('edit_party') : partyType === 'customer' ? t('add_customer') : t('add_supplier')}
          </DialogTitle>
          <DialogDescription>
            {t('party_dialog_description') || 'Fill in the details for the party.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('party_name')} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter name"
              required
              data-testid="party-name-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t('phone')}</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 9876543210"
              data-testid="party-phone-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter address"
              className="resize-none"
            />
          </div>

          {!party && (
            <>
              <div className="space-y-2">
                <Label htmlFor="opening_balance">{t('opening_balance')}</Label>
                <Input
                  id="opening_balance"
                  type="number"
                  step="0.01"
                  value={formData.opening_balance}
                  onChange={(e) => setFormData({ ...formData, opening_balance: e.target.value })}
                  placeholder="0.00"
                  data-testid="party-balance-input"
                />
              </div>

              <div className="space-y-2">
                <Label>{t('balance_type')}</Label>
                <RadioGroup
                  value={formData.balance_type}
                  onValueChange={(value: any) => setFormData({ ...formData, balance_type: value })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="none" />
                    <Label htmlFor="none" className="cursor-pointer">{t('none')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="credit" id="credit" />
                    <Label htmlFor="credit" className="cursor-pointer text-emerald-600">{t('you_got')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="debit" id="debit" />
                    <Label htmlFor="debit" className="cursor-pointer text-rose-600">{t('you_gave')}</Label>
                  </div>
                </RadioGroup>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes"
              className="resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={loading} data-testid="party-submit">
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
