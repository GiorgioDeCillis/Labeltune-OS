'use client';

import LoginView from '@/components/auth/LoginView';
import { Suspense } from 'react';

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <LoginView />
        </Suspense>
    );
}
