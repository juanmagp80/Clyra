import { Metadata } from 'next';
import InvoicesPageClient from './InvoicesPageClient';

export const metadata: Metadata = {
    title: 'Facturas | Taskelia CRM',
    description: 'Gestiona tus facturas y pagos',
};

export default function InvoicesPage() {
    return <InvoicesPageClient />;
}