"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function useAuthEvents() {
    const { status } = useSession();

    useEffect(() => {
        if (status === 'unauthenticated') {
            localStorage.removeItem('paynow-customer-token');
        }
    }, [status]);
}