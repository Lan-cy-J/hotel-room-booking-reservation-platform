import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { StatusBadge } from './StatusBadge';
import { Printer, X, Building2, Calendar, FileText, DollarSign, CheckCircle2 } from 'lucide-react';

export const InvoiceModal = ({ bookingId, onClose }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!bookingId) return;

    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const res = await api.invoices.getByBookingId(bookingId);
        if (res.success && res.data) {
          setInvoice(res.data);
        } else {
          setError(res.message || 'Unable to fetch invoice');
        }
      } catch (err) {
        setError(err.message || 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  if (!bookingId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '680px', backgroundColor: '#0B132B' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText className="font-gold" size={24} />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Tax Invoice Breakdown</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Itemized Official Billing Receipt</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid var(--border-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ marginTop: '12px' }}>Compiling itemized invoice...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#FDA4AF' }}>
            <p>{error}</p>
          </div>
        ) : invoice ? (
          <div id="printable-invoice">
            {/* Invoice Meta Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '12px',
                padding: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Invoice No</span>
                <p style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--primary-gold-light)' }}>{invoice.invoiceNumber}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Booking Ref</span>
                <p style={{ fontSize: '0.92rem', fontWeight: 600 }}>{invoice.bookingNumber}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Invoice Date</span>
                <p style={{ fontSize: '0.88rem' }}>{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</span>
                <div><StatusBadge status={invoice.bookingStatus} /></div>
              </div>
            </div>

            {/* Hotel & Guest Information */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div style={{ padding: '14px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--primary-gold-light)', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  <Building2 size={14} /> Billed By (Hotel)
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{invoice.hotel.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{invoice.hotel.address}, {invoice.hotel.city}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{invoice.hotel.contactEmail}</div>
              </div>

              <div style={{ padding: '14px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--primary-gold-light)', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  <Calendar size={14} /> Guest & Stay Details
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{invoice.guest.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {invoice.stayDetails.roomType} (Room: {invoice.stayDetails.assignedRoomNumber})
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {new Date(invoice.stayDetails.checkIn).toLocaleDateString()} — {new Date(invoice.stayDetails.checkOut).toLocaleDateString()} ({invoice.stayDetails.nights} nights, {invoice.stayDetails.guestCount} guests)
                </div>
              </div>
            </div>

            {/* Itemized Line Items */}
            <div style={{ marginBottom: '20px' }}>
              <table className="luxury-table" style={{ fontSize: '0.88rem' }}>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Amount ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item, index) => (
                    <tr key={index}>
                      <td style={{ color: item.description.includes('Dynamic') ? 'var(--primary-gold-light)' : 'var(--text-primary)' }}>
                        {item.description}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        ${item.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary Box */}
            <div
              style={{
                backgroundColor: 'rgba(212, 175, 55, 0.05)',
                border: '1px solid var(--border-gold)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: '20px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Gross Booking Total:</span>
                <span style={{ fontWeight: 600 }}>${invoice.financialSummary.grossTotal.toFixed(2)}</span>
              </div>

              {invoice.financialSummary.refundAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#34D399' }}>
                  <span>Refund Issued:</span>
                  <span style={{ fontWeight: 600 }}>-${invoice.financialSummary.refundAmount.toFixed(2)}</span>
                </div>
              )}

              {invoice.financialSummary.cancellationFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#FDA4AF' }}>
                  <span>Cancellation Surcharge:</span>
                  <span style={{ fontWeight: 600 }}>+${invoice.financialSummary.cancellationFee.toFixed(2)}</span>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px dashed var(--border-gold)',
                  fontSize: '1.1rem',
                  fontWeight: 800
                }}
              >
                <span>Net Paid Total:</span>
                <span className="font-gold" style={{ fontSize: '1.25rem' }}>
                  ${invoice.financialSummary.netPaidAmount.toFixed(2)}
                </span>
              </div>

              <div style={{ marginTop: '8px', textAlign: 'right' }}>
                <span className="badge" style={{ backgroundColor: '#064E3B', color: '#A7F3D0', border: '1px solid #059669' }}>
                  <CheckCircle2 size={12} /> {invoice.financialSummary.paymentStatus}
                </span>
              </div>
            </div>

            {/* Cancellation Details if applicable */}
            {invoice.cancellationSummary && (
              <div
                style={{
                  backgroundColor: 'rgba(244, 63, 94, 0.08)',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  fontSize: '0.85rem',
                  marginBottom: '20px',
                  color: '#FECDD3'
                }}
              >
                <strong>Cancellation Details:</strong> Reason: "{invoice.cancellationSummary.reason}" | Refund Rate: {invoice.cancellationSummary.refundPercentage} | Refund: {invoice.cancellationSummary.refundAmount}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={handlePrint} className="btn btn-secondary btn-sm">
                <Printer size={16} /> Print Receipt
              </button>
              <button onClick={onClose} className="btn btn-primary btn-sm">
                Done
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
