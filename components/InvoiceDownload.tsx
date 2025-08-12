'use client';

import { Button } from '@/components/ui/Button';
import { FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface InvoiceDownloadProps {
    invoiceId: string;
    invoiceNumber?: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'sm' | 'default' | 'lg';
    className?: string;
}

export function InvoiceDownload({
    invoiceId,
    invoiceNumber,
    variant = 'outline',
    size = 'sm',
    className = ''
}: InvoiceDownloadProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);

        try {
            const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/pdf,text/html',
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
                throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
            }

            // Obtener el tipo de contenido
            const contentType = response.headers.get('content-type') || '';
            const contentDisposition = response.headers.get('content-disposition') || '';

            // Extraer el nombre del archivo del header Content-Disposition
            let filename = `Factura__${invoiceNumber?.replace('/', '_') || invoiceId}`;
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch) {
                filename = filenameMatch[1].replace(/['"]/g, '');
            }

            // Determinar la extensión según el tipo de contenido
            if (contentType.includes('application/pdf')) {
                filename += filename.endsWith('.pdf') ? '' : '.pdf';
            } else if (contentType.includes('text/html')) {
                filename += filename.endsWith('.html') ? '' : '.html';
                toast.info('PDF no disponible, descargando como HTML');
            }

            const blob = await response.blob();

            // Crear enlace de descarga
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;

            // Trigger download
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(`Factura descargada: ${filename}`);

        } catch (error) {
            console.error('Error descargando factura:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            toast.error(`Error al descargar: ${errorMessage}`);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleDownload}
            disabled={isDownloading}
            className={`${className} text-xs`}
        >
            {isDownloading ? (
                <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Generando...
                </>
            ) : (
                <>
                    <FileText className="h-3 w-3 mr-1" />
                    Descargar PDF
                </>
            )}
        </Button>
    );
}

// Componente para el preview en lugar de descarga directa
interface InvoicePreviewProps extends InvoiceDownloadProps {
    onPreview?: () => void;
}

export function InvoicePreview({
    invoiceId,
    invoiceNumber,
    variant = 'ghost',
    size = 'sm',
    className = '',
    onPreview
}: InvoicePreviewProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handlePreview = async () => {
        setIsLoading(true);

        try {
            const url = `/api/invoices/${invoiceId}/pdf`;
            window.open(url, '_blank', 'width=800,height=1000,scrollbars=yes,resizable=yes');
            onPreview?.();

        } catch (error) {
            console.error('Error abriendo preview:', error);
            toast.error('Error al abrir la vista previa');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handlePreview}
            disabled={isLoading}
            className={`${className} text-xs`}
        >
            {isLoading ? (
                <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Cargando...
                </>
            ) : (
                <>
                    <FileText className="h-3 w-3 mr-1" />
                    Vista Previa
                </>
            )}
        </Button>
    );
}

// Hook para validar si se puede generar PDF
export function useInvoiceValidation() {
    const validateInvoice = async (invoiceId: string) => {
        try {
            const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
                method: 'HEAD' // Solo verificar sin descargar
            });

            return {
                canGenerate: response.ok,
                error: response.ok ? null : await response.text().catch(() => 'Error de validación')
            };
        } catch (error) {
            return {
                canGenerate: false,
                error: error instanceof Error ? error.message : 'Error de conexión'
            };
        }
    };

    return { validateInvoice };
}
