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
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';

interface ReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ReminderDialog({ open, onOpenChange, onSuccess }: ReminderDialogProps) {
  const { api, t } = useApp();
  const [loading, setLoading] = useState(false);
  const [parties, setParties] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    party_id: '',
    amount: '',
    due_date: addDays(new Date(), 7),
    message: ''
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
      setFormData({
        party_id: '',
        amount: '',
        due_date: addDays(new Date(), 7),
        message: ''
      });
    }
  }, [open, fetchParties]);

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
      await api().post('/reminders', {
        party_id: formData.party_id,
        amount: parseFloat(formData.amount),
        due_date: format(formData.due_date, 'yyyy-MM-dd'),
        message: formData.message || null
      });
      toast.success(t('success'), { description: 'Reminder created' });
      onSuccess();
    } catch (error: any) {
      toast.error(t('error'), { description: error.response?.data?.detail || 'Failed to create reminder' });
    } finally {
      setLoading(false);
    }
  };

  // Message templates
  const templates = [
    { label: 'Payment Due', message: 'Friendly reminder: Your payment is due. Please clear the balance at your earliest convenience.' },
    { label: 'Overdue Notice', message: 'This is a reminder that your payment is overdue. Please settle the amount as soon as possible.' },
    { label: 'Thank You', message: 'Thank you for your business! Just a reminder about the pending payment.' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('add_reminder')}</DialogTitle>
          <DialogDescription>
            {t('reminder_dialog_description') || 'Set a payment reminder for a party.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Party Selection */}
          <div className="space-y-2">
            <Label>{t('select_party')} *</Label>
            <Select
              value={formData.party_id}
              onValueChange={(value) => setFormData({ ...formData, party_id: value })}
            >
              <SelectTrigger data-testid="reminder-party-select">
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
                data-testid="reminder-amount-input"
              />
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>{t('due_date')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start" data-testid="reminder-date-picker">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {format(formData.due_date, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.due_date}
                  onSelect={(date) => date && setFormData({ ...formData, due_date: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Quick Templates */}
          <div className="space-y-2">
            <Label>Quick Templates</Label>
            <div className="flex flex-wrap gap-2">
              {templates.map((template) => (
                <Button
                  key={template.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, message: template.message })}
                >
                  {template.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">{t('message')}</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Enter reminder message"
              className="resize-none h-24"
              data-testid="reminder-message-input"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={loading} data-testid="reminder-submit">
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
