'use client';

import { useAdminHeader } from '@/components/layout/admin-header-context';


export default function Admin() {

    useAdminHeader({
        title: 'Dashboard administrativo',
        subtitle: 'Acompanhe métricas, intenções e indicações em tempo real.',
    });

    return (
        <></>
    )
}