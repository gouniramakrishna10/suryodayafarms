import React from 'react';
import { GiSun } from 'react-icons/gi';
import { FiPrinter, FiX } from 'react-icons/fi';
import { formatCurrency } from '../utils/currency';
import { calculateOrderGst, getStateCode } from '../utils/gst';

export default function GstInvoiceModal({ order, onClose }) {
  if (!order) return null;

  const shippingState = order.shippingAddress?.state || 'Telangana';
  const gstBreakdown = calculateOrderGst({
    orderItems: order.orderItems || [],
    shippingState,
    storedGst: {
      gstType: order.gstType,
      taxableAmount: order.taxableAmount,
      cgstAmount: order.cgstAmount,
      sgstAmount: order.sgstAmount,
      igstAmount: order.igstAmount,
      gstRate: order.gstRate
    }
  });

  const stateCode = getStateCode(shippingState);
  const isIntrastate = gstBreakdown.isIntrastate;
  const rawOrderNum = order.orderNumber || '';
  const invoiceNumber = `INV-${rawOrderNum.replace('SURY-', '')}`;
  const invoiceDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-[#EAE4D8] rounded-[24px] w-full max-w-4xl shadow-2xl overflow-hidden my-8 text-left font-sans flex flex-col max-h-[90vh]">
        {/* Modal Header Controls */}
        <div className="bg-[#2F3B0C] text-white p-5 px-6 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <GiSun className="text-[#C68A2B] text-2xl animate-spin-slow" />
            <h3 className="font-serif text-lg font-bold">Tax Invoice / Receipt</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#4E641A] hover:bg-[#3D5014] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <FiPrinter /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="text-stone-300 hover:text-white text-xl font-bold p-1 transition cursor-pointer"
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* Invoice Body Printable Container */}
        <div id="printable-gst-invoice" className="p-6 md:p-10 space-y-6 overflow-y-auto flex-1 bg-white text-stone-800">
          
          {/* Header Branding */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-[#4E641A] pb-6 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#2F3B0C]">
                <GiSun className="text-[#C68A2B] text-3xl" />
                <span className="font-serif text-2xl font-extrabold tracking-tight">Suryodaya Farms</span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium max-w-sm leading-relaxed">
                Plot No-20 NP, Kuruma Nagar, Peerzadiguda Mandal,<br />
                Medchal (Malkajgiri), Telangana – 500039, India<br />
                <strong>GSTIN:</strong> 36AAAAA0000A1Z5 | <strong>FSSAI:</strong> 11524999000342<br />
                <strong>State Code:</strong> 36 (Telangana)
              </p>
            </div>
            
            <div className="text-left sm:text-right space-y-1 bg-[#F9F6F0] p-4 rounded-xl border border-[#EAE4D8] min-w-[230px]">
              <span className="inline-block text-[10px] font-extrabold text-[#4E641A] uppercase tracking-widest bg-[#4E641A]/10 px-2.5 py-0.5 rounded mb-1">
                TAX INVOICE
              </span>
              <p className="text-xs font-bold text-stone-800">Invoice No: <span className="font-mono text-[#2F3B0C]">{invoiceNumber}</span></p>
              <p className="text-xs font-semibold text-stone-600">Order No: <span className="font-mono">{order.orderNumber}</span></p>
              <p className="text-xs text-stone-600">Date: <strong>{invoiceDate}</strong></p>
              <p className="text-xs text-stone-600">Place of Supply: <strong>{shippingState} (Code: {stateCode})</strong></p>
            </div>
          </div>

          {/* Billed To / Shipped To Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#FDFBF7] p-5 rounded-2xl border border-[#EAE4D8] text-xs">
            <div className="space-y-1">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400 block">CUSTOMER DETAILS (BUYER)</span>
              <h4 className="font-bold text-[#2F3B0C] text-sm">{order.shippingAddress?.recipientName || order.user?.name || 'Valued Customer'}</h4>
              <p className="text-stone-600 leading-relaxed font-medium">
                {order.shippingAddress?.street}<br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state} – {order.shippingAddress?.postalCode}<br />
                Country: {order.shippingAddress?.country || 'India'}<br />
                Phone: <strong>{order.shippingAddress?.phone || order.user?.mobile || 'N/A'}</strong>
              </p>
            </div>

            <div className="space-y-1 sm:border-l sm:border-[#EAE4D8] sm:pl-6">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400 block">TAXATION TYPE & PAYMENT</span>
              <p className="text-stone-700"><strong>GST Mode:</strong> {isIntrastate ? 'Intrastate (CGST 2.5% + SGST 2.5%)' : 'Interstate (IGST 5%)'}</p>
              <p className="text-stone-700"><strong>Payment Gateway:</strong> {order.paymentMethod || 'RAZORPAY'}</p>
              <p className="text-stone-700"><strong>Payment Status:</strong> <span className="font-bold text-[#4E641A] uppercase">{order.paymentStatus || 'PAID'}</span></p>
              <p className="text-stone-700"><strong>State Code:</strong> {stateCode}</p>
            </div>
          </div>

          {/* Product Items Table with GST Columns */}
          <div className="overflow-x-auto rounded-2xl border border-[#EAE4D8]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#4E641A] text-white font-serif font-bold text-[11px] uppercase tracking-wider">
                  <th className="p-3 pl-4">Product Description</th>
                  <th className="p-3 text-center">HSN</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price (Inc.)</th>
                  <th className="p-3 text-right">Taxable Value</th>
                  {isIntrastate ? (
                    <>
                      <th className="p-3 text-right">CGST (2.5%)</th>
                      <th className="p-3 text-right">SGST (2.5%)</th>
                    </>
                  ) : (
                    <th className="p-3 text-right">IGST (5%)</th>
                  )}
                  <th className="p-3 pr-4 text-right">Total Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150">
                {(gstBreakdown?.items || []).map((item, idx) => {
                  const name = item.product?.name || item.name || 'Product';
                  const weight = item.variant?.name || item.product?.weight || '';
                  return (
                    <tr key={idx} className="hover:bg-stone-50 transition font-medium text-stone-700">
                      <td className="p-3 pl-4">
                        <strong className="text-stone-850 font-semibold block">{name}</strong>
                        {weight && <span className="text-[10px] text-stone-500 font-sans">{weight}</span>}
                      </td>
                      <td className="p-3 text-center font-mono text-[11px]">{item.hsnCode || '1106'}</td>
                      <td className="p-3 text-center font-bold">{item.quantity}</td>
                      <td className="p-3 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                      <td className="p-3 text-right font-mono font-semibold">{formatCurrency(item.taxableAmount)}</td>
                      {isIntrastate ? (
                        <>
                          <td className="p-3 text-right font-mono text-stone-600">{formatCurrency(item.cgstAmount)}</td>
                          <td className="p-3 text-right font-mono text-stone-600">{formatCurrency(item.sgstAmount)}</td>
                        </>
                      ) : (
                        <td className="p-3 text-right font-mono text-stone-600">{formatCurrency(item.igstAmount)}</td>
                      )}
                      <td className="p-3 pr-4 text-right font-mono font-bold text-[#2F3B0C]">{formatCurrency(item.totalPriceInclusive)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tax & Total Summary Card */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pt-2">
            <div className="space-y-1 text-xs text-stone-500 max-w-sm">
              <p className="font-semibold text-stone-700">Declaration & Terms:</p>
              <p className="text-[10px] leading-relaxed">
                We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct. All prices are inclusive of GST @ 5%.
              </p>
            </div>

            <div className="w-full sm:w-80 bg-[#F9F6F0] p-4 rounded-2xl border border-[#EAE4D8] space-y-2 text-xs font-semibold text-stone-700">
              <div className="flex justify-between border-b pb-1.5 border-stone-200">
                <span>Total Taxable Value</span>
                <span className="font-mono font-bold text-stone-850">{formatCurrency(gstBreakdown.taxableAmount)}</span>
              </div>

              {isIntrastate ? (
                <>
                  <div className="flex justify-between border-b pb-1.5 border-stone-200 text-stone-600">
                    <span>CGST Total (2.5%)</span>
                    <span className="font-mono">{formatCurrency(gstBreakdown.cgstAmount)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5 border-stone-200 text-stone-600">
                    <span>SGST Total (2.5%)</span>
                    <span className="font-mono">{formatCurrency(gstBreakdown.sgstAmount)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between border-b pb-1.5 border-stone-200 text-stone-600">
                  <span>IGST Total (5.0%)</span>
                  <span className="font-mono">{formatCurrency(gstBreakdown.igstAmount)}</span>
                </div>
              )}

              <div className="flex justify-between border-b pb-1.5 border-stone-200 text-stone-600">
                <span>Total GST Extracted</span>
                <span className="font-mono">{formatCurrency(gstBreakdown.totalGst)}</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-700 border-b pb-1.5 border-stone-200">
                  <span>Coupon Discount Applied</span>
                  <span className="font-mono">- {formatCurrency(order.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm pt-1 font-bold text-[#2F3B0C]">
                <span>Grand Total (Amount Paid)</span>
                <span className="font-mono text-base text-[#4E641A]">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Authorized Signature Footer */}
          <div className="pt-6 border-t border-stone-200 flex justify-between items-end text-xs text-stone-500">
            <div>
              <p className="font-bold text-[#2F3B0C]">Thank you for choosing Suryodaya Farms!</p>
              <p className="text-[10px]">For support: care@suryodayafarms.com | +91 9100422140</p>
            </div>
            <div className="text-right">
              <div className="h-10 text-stone-300 font-serif italic text-sm">Suryodaya Authorised Signatory</div>
              <p className="font-bold text-stone-700 text-[10px] uppercase tracking-wider">Authorized Signatory</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
