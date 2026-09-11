import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-6xl font-extrabold text-indigo-600 tracking-tight">404</h1>
      <h2 className="mt-4 text-xl font-bold text-gray-900">Page Not Found</h2>
      <p className="mt-2 text-sm text-gray-500 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/dashboard" className="mt-6">
        <Button className="gap-2">
          <Home className="h-4 w-4" />
          <span>Return to Dashboard</span>
        </Button>
      </Link>
    </div>
  );
}
