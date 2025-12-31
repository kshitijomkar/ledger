'use client';

import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Globe, Palette, Type, Sun, Moon, Waves, LogOut, User
} from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { user, t, language, theme, fontSize, updateSettings, logout } = useApp();

  const handleLanguageChange = async (value: string) => {
    try {
      await updateSettings({ language: value });
      toast.success(t('success'), { description: 'Language updated' });
    } catch (error) {
      toast.error(t('error'), { description: 'Failed to update language' });
    }
  };

  const handleThemeChange = async (value: string) => {
    try {
      await updateSettings({ theme: value });
      toast.success(t('success'), { description: 'Theme updated' });
    } catch (error) {
      toast.error(t('error'), { description: 'Failed to update theme' });
    }
  };

  const handleFontSizeChange = async (value: string) => {
    try {
      await updateSettings({ font_size: value });
      toast.success(t('success'), { description: 'Font size updated' });
    } catch (error) {
      toast.error(t('error'), { description: 'Failed to update font size' });
    }
  };

  const themes = [
    { id: 'theme-classic', name: t('classic_theme'), icon: Sun, color: 'bg-rose-500' },
    { id: 'theme-ocean', name: t('ocean_theme'), icon: Waves, color: 'bg-blue-500' },
    { id: 'theme-midnight', name: t('midnight_theme'), icon: Moon, color: 'bg-slate-800' },
  ];

  return (
    <div className="space-y-6 max-w-2xl" data-testid="settings-page">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" role="heading" aria-level={1}>{t('settings')}</h1>
        <p className="text-muted-foreground">Customize your experience</p>
      </div>

      <Card className="animate-slideUp stagger-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {t('profile')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="text-lg font-semibold">{user?.name}</p>
              <p className="text-muted-foreground">{user?.email}</p>
              {user?.phone && <p className="text-sm text-muted-foreground">{user?.phone}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="animate-slideUp stagger-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {t('language')}
          </CardTitle>
          <CardDescription>Choose your preferred language</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
              <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="animate-slideUp stagger-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            {t('theme')}
          </CardTitle>
          <CardDescription>Choose your color theme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3" role="group" aria-label="Select theme">
            {themes.map((themeOption) => (
              <button
                key={themeOption.id}
                onClick={() => handleThemeChange(themeOption.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  theme === themeOption.id 
                    ? 'border-primary bg-primary/5 shadow-inner' 
                    : 'border-border hover:border-primary/50'
                }`}
                aria-pressed={theme === themeOption.id}
                aria-label={`Select ${themeOption.name} theme`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${themeOption.color} flex items-center justify-center shadow-sm`}>
                    <themeOption.icon className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <span className="font-medium">{themeOption.name}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="animate-slideUp stagger-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            {t('font_size')}
          </CardTitle>
          <CardDescription>Adjust text size for better readability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3" role="group" aria-label="Select font size">
            {[
              { id: 'small', name: t('small') },
              { id: 'medium', name: t('medium') },
              { id: 'large', name: t('large') },
              { id: 'xlarge', name: t('extra_large') },
            ].map((sizeOption) => (
              <button
                key={sizeOption.id}
                onClick={() => handleFontSizeChange(sizeOption.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  fontSize === sizeOption.id 
                    ? 'border-primary bg-primary/5 shadow-inner' 
                    : 'border-border hover:border-primary/50'
                }`}
                aria-pressed={fontSize === sizeOption.id}
                aria-label={`Select ${sizeOption.name} font size`}
              >
                <span className="font-medium">{sizeOption.name}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button 
        variant="destructive" 
        className="w-full animate-slideUp stagger-5 rounded-xl h-12 font-semibold shadow-lg"
        onClick={logout}
        aria-label={t('logout')}
      >
        <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
        {t('logout')}
      </Button>
    </div>
  );
}
