'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/components/Toast';

export function ToastQueryHandler() {
    const searchParams = useSearchParams();
    const { showToast } = useToast();

    useEffect(() => {
        const error = searchParams.get('error');
        const success = searchParams.get('success');

        if (error) {
            showToast(error, 'error');
            // Clean up URL
            window.history.replaceState(null, '', window.location.pathname);
        } else if (success) {
            showToast(success, 'success');
            window.history.replaceState(null, '', window.location.pathname);
        }
    }, [searchParams, showToast]);

    return null;
}
