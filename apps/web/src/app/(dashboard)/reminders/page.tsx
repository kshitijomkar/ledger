'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, Bell, Clock, CheckCircle, AlertCircle, Calendar, Trash2
} from 'lucide-react';
import { ReminderDialog } from '@/components/Dialogs/ReminderDialog';
import { toast } from 'sonner';
import { format, parseISO, isPast, isToday } from 'date-fns';

export default function Reminders() {
  const { api, t, formatCurrency } = useApp();
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filter, setFilter] = useState('pending');

  const fetchReminders = async () => {
    try {
      const res = await api().get(`/reminders${filter ? `?status=${filter}` : ''}`);
      setReminders(res.data);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [filter]);

  const handleMarkComplete = async (id: string) => {
    try {
      await api().put(`/reminders/${id}/status?status=completed`);
      toast.success(t('success'), { description: 'Reminder marked as complete' });
      fetchReminders();
    } catch (error) {
      toast.error(t('error'), { description: 'Failed to update reminder' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('are_you_sure'))) return;
    try {
      await api().delete(`/reminders/${id}`);
      toast.success(t('success'), { description: 'Reminder deleted' });
      fetchReminders();
    } catch (error) {
      toast.error(t('error'), { description: 'Failed to delete reminder' });
    }
  };

  const getStatusInfo = (reminder: any) => {
    const dueDate = parseISO(reminder.due_date);
    if (reminder.status === 'completed') {
      return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', label: t('completed') };
    }
    if (isPast(dueDate) && !isToday(dueDate)) {
      return { icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', label: t('overdue') };
    }
    if (isToday(dueDate)) {
      return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Due Today' };
    }
    return { icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', label: t('pending') };
  };

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
    <div className="space-y-6" data-testid="reminders-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" role="heading" aria-level={1}>{t('reminders')}</h1>
          <p className="text-muted-foreground" aria-live="polite">{reminders.length} reminders</p>
        </div>
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="rounded-full"
          data-testid="add-reminder-btn"
          aria-label={t('add_reminder')}
        >
          <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
          {t('add_reminder')}
        </Button>
      </div>

      <div className="flex gap-2" role="group" aria-label="Filter reminders by status">
        <Button 
          variant={filter === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('pending')}
          aria-pressed={filter === 'pending'}
        >
          {t('pending')}
        </Button>
        <Button 
          variant={filter === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('completed')}
          aria-pressed={filter === 'completed'}
        >
          {t('completed')}
        </Button>
        <Button 
          variant={filter === '' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('')}
          aria-pressed={filter === ''}
        >
          {t('all')}
        </Button>
      </div>

      {reminders.length === 0 ? (
        <Card className="p-8 text-center animate-fadeIn">
          <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t('no_data')}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder, index) => {
            const statusInfo = getStatusInfo(reminder);
            const StatusIcon = statusInfo.icon;
            
            return (
              <Card key={reminder.id} className="card-interactive animate-slideUp" style={{ animationDelay: `${index * 0.05}s` }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${statusInfo.bg}`}>
                        <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{reminder.party_name}</p>
                        <p className="text-lg font-bold money-debit mt-1">
                          {formatCurrency(reminder.amount)}
                        </p>
                        {reminder.message && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {reminder.message}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Due: {format(parseISO(reminder.due_date), 'PP')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {reminder.status === 'pending' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleMarkComplete(reminder.id)}
                          className="text-emerald-600 hover:bg-emerald-50 border-emerald-200"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {t('mark_complete')}
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-rose-600"
                        onClick={() => handleDelete(reminder.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ReminderDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => {
          setShowAddDialog(false);
          fetchReminders();
        }}
      />

      <button 
        className="fab"
        onClick={() => setShowAddDialog(true)}
        data-testid="add-reminder-fab"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
