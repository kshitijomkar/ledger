'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, TrendingUp, TrendingDown, Users
} from 'lucide-react';

export default function Reports() {
  const { api, t, formatCurrency } = useApp();
  const [loading, setLoading] = useState(true);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [partyData, setPartyData] = useState<any[]>([]);
  const [days, setDays] = useState(30);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [dailyRes, partyRes] = await Promise.all([
        api().get(`/reports/daily?days=${days}`),
        api().get('/reports/party-wise')
      ]);
      setDailyData(dailyRes.data || []);
      setPartyData(partyRes.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }, [api, days]);

  useEffect(() => {
    fetchData();
  }, [days, fetchData]);

  const maxDailyValue = Math.max(
    ...(dailyData.length > 0 ? dailyData : [{credit: 0, debit: 0}]).map(d => Math.max(d.credit || 0, d.debit || 0)),
    1
  );

  const totalCredit = dailyData.reduce((sum, d) => sum + (d.credit || 0), 0);
  const totalDebit = dailyData.reduce((sum, d) => sum + (d.debit || 0), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="reports-page">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" role="heading" aria-level={1}>{t('reports')}</h1>
        <p className="text-muted-foreground">Analyze your business performance</p>
      </div>

      <Tabs defaultValue="daily" className="space-y-6" aria-label="Report types">
        <TabsList role="tablist">
          <TabsTrigger value="daily" role="tab">{t('daily_report')}</TabsTrigger>
          <TabsTrigger value="party" role="tab">{t('party_wise')}</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6">
          <div className="flex gap-2" role="group" aria-label="Select number of days to display">
            {[7, 15, 30, 90].map((d) => (
              <Button 
                key={d}
                variant={days === d ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDays(d)}
                aria-pressed={days === d}
              >
                {d} Days
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="stat-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <p className="text-sm text-muted-foreground">Total {t('credit')}</p>
                </div>
                <p className="text-2xl font-bold money-credit mt-2">{formatCurrency(totalCredit)}</p>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-rose-600" />
                  <p className="text-sm text-muted-foreground">Total {t('debit')}</p>
                </div>
                <p className="text-2xl font-bold money-debit mt-2">{formatCurrency(totalDebit)}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="animate-fadeIn">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Daily Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dailyData.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t('no_data')}</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-end gap-1 h-48 overflow-x-auto pb-4 scrollbar-hide">
                    {dailyData.slice(-15).map((day, index) => (
                      <div key={day.date} className="flex-1 min-w-[40px] flex flex-col items-center gap-1 animate-slideUp" style={{ animationDelay: `${index * 0.03}s` }}>
                        <div className="w-full flex gap-0.5 items-end h-36">
                          <div 
                            className="flex-1 bg-emerald-500 rounded-t transition-all hover:brightness-110"
                            style={{ height: `${((day.credit || 0) / maxDailyValue) * 100}%` }}
                            title={`Credit: ${formatCurrency(day.credit || 0)}`}
                          />
                          <div 
                            className="flex-1 bg-rose-500 rounded-t transition-all hover:brightness-110"
                            style={{ height: `${((day.debit || 0) / maxDailyValue) * 100}%` }}
                            title={`Debit: ${formatCurrency(day.debit || 0)}`}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground rotate-45 mt-2">
                          {day.date.split('-').slice(1).join('/')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="party" className="space-y-6">
          <Card className="animate-fadeIn">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Party Wise Balances
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr className="text-xs uppercase text-muted-foreground">
                      <th className="text-left p-3 font-medium">{t('party_name')}</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-right p-3 font-medium">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {partyData.map((party, index) => (
                      <tr key={party.id} className="hover:bg-muted/50 text-sm transition-colors animate-slideUp" style={{ animationDelay: `${index * 0.02}s` }}>
                        <td className="p-3 font-medium">{party.name}</td>
                        <td className="p-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            party.party_type === 'customer' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {party.party_type}
                          </span>
                        </td>
                        <td className={`p-3 text-right font-bold tabular-nums ${
                          party.balance_type === 'credit' ? 'money-credit' : 'money-debit'
                        }`}>
                          {formatCurrency(Math.abs(party.balance || 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
