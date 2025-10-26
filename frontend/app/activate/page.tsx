"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function ActivateAccountPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const activateAccount = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid activation link. Please check your email for the correct link.');
        return;
      }

      try {
        const result = await api.activateAccount(token);
        setStatus('success');
        setMessage(result.message || 'Account activated successfully! You can now log in.');
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Failed to activate account. The link may have expired.');
      }
    };

    activateAccount();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Account Activation
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Activating your account...'}
            {status === 'success' && 'Account Activated Successfully'}
            {status === 'error' && 'Activation Failed'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">Please wait while we activate your account...</p>
            </div>
          )}

          {status === 'success' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <Alert className="bg-red-50 border-red-200">
              <XCircle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-800">
                {message}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col space-y-3">
            {status === 'success' && (
              <p className="text-sm text-gray-600 text-center">
                You will be redirected to the login page shortly...
              </p>
            )}
            
            {status === 'error' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 text-center">
                  If your activation link has expired, please contact support or try registering again.
                </p>
                <Button 
                  onClick={() => router.push('/')}
                  className="w-full"
                >
                  Go to Login
                </Button>
                <Button 
                  onClick={() => router.push('/register')}
                  variant="outline"
                  className="w-full"
                >
                  Register Again
                </Button>
              </div>
            )}
            
            {status === 'loading' && (
              <Button 
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full"
                disabled
              >
                Go to Login
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}