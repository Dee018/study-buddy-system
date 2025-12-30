import React from 'react';

export default function Login() {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const pwReset = params.get('password_reset');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {pwReset === 'success' ? (
          <div className="bg-white dark:bg-card shadow rounded-lg p-6 text-center">
            <h2 className="text-2xl font-semibold mb-2">Password Reset Successful</h2>
            <p className="text-sm text-muted-foreground mb-4">Your password has been updated. You can now sign in with your new password.</p>
            <div className="flex justify-center">
              <a href="/" className="px-4 py-2 bg-primary text-white rounded">Go to Sign In</a>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-card shadow rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Sign In</h2>
            <p className="text-sm text-muted-foreground mb-4">Use the main landing page to sign in.</p>
            <div className="flex justify-center">
              <a href="/" className="px-4 py-2 bg-primary text-white rounded">Open Sign In</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
