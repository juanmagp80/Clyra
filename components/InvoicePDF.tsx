// components/InvoicePDF.tsx
import { Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import React from 'react';

// ✅ ESTILOS SIN FUENTES PERSONALIZADAS (eliminadas para evitar errores)
const styles = StyleSheet.create({
    page: {
        fontSize: 11,
        paddingTop: 30,
        paddingLeft: 30,
        paddingRight: 30,
        paddingBottom: 30,
        backgroundColor: '#ffffff'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#2563eb'
    },
    logo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2563eb'
    },
    invoiceTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'right'
    },
    invoiceNumber: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'right',
        marginTop: 5
    },
    section: {
        margin: 10,
        padding: 10
    },
    clientInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    clientBox: {
        width: '45%'
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    text: {
        fontSize: 11,
        color: '#4b5563',
        marginBottom: 3
    },
    table: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderStyle: 'solid',
        marginVertical: 10
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        borderBottomStyle: 'solid',
        minHeight: 35,
        alignItems: 'center'
    },
    tableHeader: {
        backgroundColor: '#f3f4f6',
        fontWeight: 'bold'
    },
    tableColDesc: {
        width: '40%',
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderRightWidth: 1,
        borderRightColor: '#e5e7eb',
        borderRightStyle: 'solid'
    },
    tableColQty: {
        width: '15%',
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderRightWidth: 1,
        borderRightColor: '#e5e7eb',
        borderRightStyle: 'solid',
        textAlign: 'center'
    },
    tableColPrice: {
        width: '22.5%',
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderRightWidth: 1,
        borderRightColor: '#e5e7eb',
        borderRightStyle: 'solid',
        textAlign: 'right'
    },
    tableColTotal: {
        width: '22.5%',
        paddingHorizontal: 8,
        paddingVertical: 8,
        textAlign: 'right'
    },
    tableCellHeader: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#374151'
    },
    tableCell: {
        fontSize: 10,
        color: '#4b5563'
    },
    totalsSection: {
        marginTop: 20,
        alignItems: 'flex-end'
    },
    totalsBox: {
        width: '300px',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderStyle: 'solid'
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb'
    },
    totalRowFinal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 8,
        backgroundColor: '#f3f4f6',
        fontWeight: 'bold'
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 10
    },
    footerText: {
        fontSize: 9,
        color: '#9ca3af'
    },
    notes: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#f9fafb',
        borderLeftWidth: 4,
        borderLeftColor: '#2563eb'
    },
    notesTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 5
    },
    notesText: {
        fontSize: 10,
        color: '#6b7280',
        lineHeight: 1.4
    }
});

interface InvoicePDFProps {
    invoice: {
        id: string;
        invoice_number: string;
        title: string;
        description?: string;
        amount: number;
        tax_rate: number;
        tax_amount: number;
        total_amount: number;
        status: string;
        issue_date: string;
        due_date: string;
        notes?: string;
        created_at: string;
        client?: {
            name: string;
            company?: string;
            email?: string;
            phone?: string;
        };
        project?: {
            name: string;
            description?: string;
        };
    };
    items: Array<{
        id: string;
        description: string;
        quantity: number;
        unit_price: number;
        total: number;
    }>;
    companyInfo?: {
        name: string;
        address?: string;
        phone?: string;
        email?: string;
        website?: string;
    };
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, items, companyInfo }) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return `$${amount.toFixed(2)}`;
    };

    return (
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.logo}>
                        {companyInfo?.name || 'Tu Empresa'}
                    </Text>
                    {companyInfo?.email && (
                        <Text style={styles.text}>{companyInfo.email}</Text>
                    )}
                    {companyInfo?.phone && (
                        <Text style={styles.text}>{companyInfo.phone}</Text>
                    )}
                    {companyInfo?.website && (
                        <Text style={styles.text}>{companyInfo.website}</Text>
                    )}
                </View>
                <View>
                    <Text style={styles.invoiceTitle}>FACTURA</Text>
                    <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
                    <Text style={styles.text}>Estado: {invoice.status}</Text>
                </View>
            </View>

            {/* Client Information */}
            <View style={styles.clientInfo}>
                <View style={styles.clientBox}>
                    <Text style={styles.sectionTitle}>Facturar a:</Text>
                    {invoice.client && (
                        <>
                            <Text style={styles.text}>{invoice.client.name}</Text>
                            {invoice.client.company && (
                                <Text style={styles.text}>{invoice.client.company}</Text>
                            )}
                            {invoice.client.email && (
                                <Text style={styles.text}>{invoice.client.email}</Text>
                            )}
                            {invoice.client.phone && (
                                <Text style={styles.text}>{invoice.client.phone}</Text>
                            )}
                        </>
                    )}
                </View>
                <View style={styles.clientBox}>
                    <Text style={styles.sectionTitle}>Detalles de la Factura:</Text>
                    <Text style={styles.text}>Fecha de Emisión: {formatDate(invoice.issue_date)}</Text>
                    <Text style={styles.text}>Fecha de Vencimiento: {formatDate(invoice.due_date)}</Text>
                    {invoice.project && (
                        <Text style={styles.text}>Proyecto: {invoice.project.name}</Text>
                    )}
                </View>
            </View>

            {/* Invoice Title and Description */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{invoice.title}</Text>
                {invoice.description && (
                    <Text style={styles.text}>{invoice.description}</Text>
                )}
            </View>

            {/* Items Table */}
            <View style={styles.table}>
                {/* Header */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                    <View style={styles.tableColDesc}>
                        <Text style={styles.tableCellHeader}>Descripción</Text>
                    </View>
                    <View style={styles.tableColQty}>
                        <Text style={styles.tableCellHeader}>Cant.</Text>
                    </View>
                    <View style={styles.tableColPrice}>
                        <Text style={styles.tableCellHeader}>Precio Unit.</Text>
                    </View>
                    <View style={styles.tableColTotal}>
                        <Text style={styles.tableCellHeader}>Total</Text>
                    </View>
                </View>

                {/* Items */}
                {items.map((item, index) => (
                    <View style={styles.tableRow} key={index}>
                        <View style={styles.tableColDesc}>
                            <Text style={styles.tableCell}>{item.description}</Text>
                        </View>
                        <View style={styles.tableColQty}>
                            <Text style={styles.tableCell}>{item.quantity}</Text>
                        </View>
                        <View style={styles.tableColPrice}>
                            <Text style={styles.tableCell}>{formatCurrency(item.unit_price)}</Text>
                        </View>
                        <View style={styles.tableColTotal}>
                            <Text style={styles.tableCell}>{formatCurrency(item.total)}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Totals */}
            <View style={styles.totalsSection}>
                <View style={styles.totalsBox}>
                    <View style={styles.totalRow}>
                        <Text style={styles.text}>Subtotal:</Text>
                        <Text style={styles.text}>{formatCurrency(invoice.amount)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.text}>Impuestos ({invoice.tax_rate}%):</Text>
                        <Text style={styles.text}>{formatCurrency(invoice.tax_amount)}</Text>
                    </View>
                    <View style={styles.totalRowFinal}>
                        <Text style={[styles.text, { fontWeight: 'bold' }]}>Total:</Text>
                        <Text style={[styles.text, { fontWeight: 'bold' }]}>{formatCurrency(invoice.total_amount)}</Text>
                    </View>
                </View>
            </View>

            {/* Notes */}
            {invoice.notes && (
                <View style={styles.notes}>
                    <Text style={styles.notesTitle}>Notas:</Text>
                    <Text style={styles.notesText}>{invoice.notes}</Text>
                </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Factura generada el {formatDate(new Date().toISOString())}
                </Text>
                <Text style={styles.footerText}>
                    Gracias por su confianza
                </Text>
            </View>
        </Page>
    );
};

export default InvoicePDF;