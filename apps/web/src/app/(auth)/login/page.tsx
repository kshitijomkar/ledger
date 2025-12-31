'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, BookOpen } from 'lucide-react';

interface FormData {
  email: string;
  password: string;
}

export default function Login() {
  const router = useRouter();
  const { login, t } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password) {
      toast.error('Validation Error', {
        description: 'Please fill in all fields',
      });
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Success', {
        description: 'Welcome back!',
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast.error('Login Failed', {
        description: error.response?.data?.detail || 'Invalid credentials',
      });
      setFormData({ ...formData, password: '' });
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setFormData({
      email: 'demo@khatabook.com',
      password: 'demo123',
    });
    toast.info(t('demo_credentials_filled'), {
      description: t('demo_credentials_message'),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background p-4">
      <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Logo & Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold">Khatabook Pro</h1>
          <p className="text-muted-foreground">
            Digital ledger for smart business
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="h-12"
                  disabled={loading}
                  autoComplete="email"
                  data-testid="login-email"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="h-12"
                  disabled={loading}
                  autoComplete="current-password"
                  data-testid="login-password"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 rounded-full text-base font-semibold"
                disabled={loading}
                data-testid="login-submit"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                Don't have an account?{' '}
              </span>
              <Link
                href="/register"
                className="text-primary font-medium hover:underline"
              >
                Register
              </Link>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-muted rounded-xl border border-border">
              <p className="text-sm font-medium mb-3">Demo Credentials:</p>
              <div className="space-y-1 mb-3">
                <p className="text-xs text-muted-foreground">
                  Email: <code className="bg-background px-2 py-1 rounded text-xs">demo@khatabook.com</code>
                </p>
                <p className="text-xs text-muted-foreground">
                  Password: <code className="bg-background px-2 py-1 rounded text-xs">demo123</code>
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => fillDemoCredentials()}
                disabled={loading}
                data-testid="use-demo-btn"
              >
                Use Demo Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          By logging in, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
