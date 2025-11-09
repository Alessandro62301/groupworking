'use client';

import { useAdminHeader } from '@/components/layout/admin-header-context';


export default function Admin() {

    useAdminHeader({
        title: 'Avisos',
        subtitle: 'Acompanhe métricas, intenções e indicações em tempo real.',
    });

    return (
        <></>
    )
}