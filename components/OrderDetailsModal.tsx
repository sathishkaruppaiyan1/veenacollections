import React, { useEffect } from 'react';
import { X, Package, Truck, CheckCircle2, Clock, MapPin, CreditCard, ExternalLink, ShoppingBag, XCircle } from 'lucide-react';
import { Order } from '../types';

interface TrackingInfo {
  tracking_number: string;
  tracking_provider: string;
  tracking_link: string;
  date_shipped: string;
  status?: string;
}

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  tracking?: TrackingInfo[];
}

const PLACEHOLDER = 'https://placehold.co/200x200/f3f4f6/9ca3af?text=Item';

export const statusStyles = (status: string): { pill: string; dot: string; label: string } => {
  const s = (status || '').toLowerCase();
  if (s === 'completed') return { pill: 'bg-green-100 text-green-700', dot: 'bg-green-500', label: 'Delivered' };
  if (s === 'shipped') return { pill: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', label: 'Shipped' };
  if (s === 'processing') return { pill: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', label: 'Processing' };
  if (s === 'on-hold') return { pill: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500', label: 'On Hold' };
  if (s === 'pending') return { pill: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400', label: 'Pending' };
  if (s === 'cancelled') return { pill: 'bg-red-100 text-red-600', dot: 'bg-red-500', label: 'Cancelled' };
  if (s === 'refunded') return { pill: 'bg-red-100 text-red-600', dot: 'bg-red-500', label: 'Refunded' };
  if (s === 'failed') return { pill: 'bg-red-100 text-red-600', dot: 'bg-red-500', label: 'Failed' };
  return { pill: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400', label: status };
};

const STEPS = [
  { key: 'placed', label: 'Placed', Icon: ShoppingBag },
  { key: 'processing', label: 'Processing', Icon: Clock },
  { key: 'shipped', label: 'Shipped', Icon: Truck },
  { key: 'completed', label: 'Delivered', Icon: CheckCircle2 },
];

const stepIndex = (status: string): number => {
  const s = (status || '').toLowerCase();
  if (s === 'completed') return 3;
  if (s === 'shipped') return 2;
  if (s === 'processing' || s === 'on-hold') return 1;
  return 0;
};

const money = (v?: string | number) => {
  const n = typeof v === 'number' ? v : parseFloat(v || '0');
  return '$' + (isNaN(n) ? 0 : n).toFixed(2);
};

const formatAddress = (a?: Order['billing']): string[] | null => {
  if (!a) return null;
  const lines = [
    [a.first_name, a.last_name].filter(Boolean).join(' '),
    a.company,
    a.address_1,
    a.address_2,
    [a.city, a.state, a.postcode].filter(Boolean).join(', '),
    a.country,
  ].filter((l) => l && String(l).trim()) as string[];
  return lines.length ? lines : null;
};

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, isOpen, onClose, tracking = [] }) => {
  // Lock body scroll + close on Escape while the sheet is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const sty = statusStyles(order.status);
  const cancelled = ['cancelled', 'refunded', 'failed'].includes((order.status || '').toLowerCase());
  const active = stepIndex(order.status);
  const shipTo = formatAddress(order.shipping) || formatAddress(order.billing);
  const billTo = formatAddress(order.billing);
  const itemCount = order.line_items.reduce((acc, li) => acc + (li.quantity || 0), 0);
  const discount = parseFloat(order.discount_total || '0');
  const shippingCost = parseFloat(order.shipping_total || '0');
  const tax = parseFloat(order.total_tax || '0');

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 order-modal-fade" onClick={onClose} />

      {/* Bottom sheet on mobile, centered card on desktop */}
      <div
        className="relative w-full sm:max-w-lg bg-[#F7F7F8] rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden order-modal-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0 bg-white">
          <div className="w-10 h-1.5 rounded-full bg-gray-300" />
        </div>

        {/* App-style top bar */}
        <div className="shrink-0 bg-white px-4 pb-3 sm:pt-4 flex items-start justify-between border-b border-gray-100">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Order details</p>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">#{order.number || order.id}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date(order.date_created).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
              {' · '}{itemCount} item{itemCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${sty.pill}`}>{sty.label}</span>
            <button
              onClick={onClose}
              aria-label="Close order details"
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-3">

          {/* Progress tracker */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            {cancelled ? (
              <div className="flex items-center gap-3 text-red-600">
                <XCircle size={22} />
                <div>
                  <p className="text-sm font-bold">Order {sty.label.toLowerCase()}</p>
                  <p className="text-xs text-gray-500">This order is no longer being processed.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start">
                {STEPS.map((step, i) => {
                  const done = i <= active;
                  const StepIcon = step.Icon;
                  return (
                    <React.Fragment key={step.key}>
                      <div className="flex flex-col items-center gap-1.5">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center transition ${done ? 'bg-[#EE6348] text-white' : 'bg-gray-100 text-gray-400'}`}>
                          <StepIcon size={16} />
                        </div>
                        <span className={`text-[10px] font-bold text-center leading-tight ${done ? 'text-gray-800' : 'text-gray-400'}`}>{step.label}</span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`flex-1 h-1 rounded-full mt-4 mx-1 ${i < active ? 'bg-[#EE6348]' : 'bg-gray-100'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tracking */}
          {tracking.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Shipment tracking</p>
              {tracking.map((t, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EE6348]/10 text-[#EE6348] flex items-center justify-center shrink-0">
                    <Truck size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-800 truncate">{t.tracking_provider || 'Courier'}</p>
                    <p className="text-xs text-gray-500 truncate">{t.tracking_number}</p>
                  </div>
                  {t.tracking_link && (
                    <a
                      href={t.tracking_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-[#EE6348] px-3 py-1.5 rounded-full bg-[#EE6348]/10 hover:bg-[#EE6348] hover:text-white transition"
                    >
                      Track <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Items */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Items</p>
            <div className="divide-y divide-gray-100">
              {order.line_items.map((item, idx) => (
                <div key={item.id ?? idx} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <img
                    src={item.image || PLACEHOLDER}
                    alt={item.name}
                    loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
                    className="w-16 h-16 rounded-xl object-cover bg-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 leading-snug">{item.name}</p>
                    {item.meta && item.meta.length > 0 && (
                      <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                        {item.meta.map((m) => `${m.label}: ${m.value}`).join(' · ')}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-gray-500">Qty {item.quantity}</span>
                      <span className="text-sm font-bold text-gray-900">{money(item.total)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment summary */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Payment summary</p>
            <div className="space-y-2 text-sm">
              {order.subtotal && (
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-green-600"><span>Discount</span><span>-{money(discount)}</span></div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping{order.shipping_method ? ` (${order.shipping_method})` : ''}</span>
                <span>{shippingCost > 0 ? money(shippingCost) : 'Free'}</span>
              </div>
              {tax > 0 && (
                <div className="flex justify-between text-gray-600"><span>Tax</span><span>{money(tax)}</span></div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-100 text-base font-bold text-gray-900">
                <span>Total</span><span className="text-[#EE6348]">{money(order.total)}</span>
              </div>
            </div>
            {order.payment_method_title && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                <CreditCard size={14} /> Paid via <span className="font-bold text-gray-700">{order.payment_method_title}</span>
              </div>
            )}
          </div>

          {/* Addresses */}
          {(shipTo || billTo) && (
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
              {shipTo && (
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Delivery address</p>
                    <p className="text-sm text-gray-700 leading-relaxed mt-1">{shipTo.join(', ')}</p>
                    {order.billing?.phone && <p className="text-xs text-gray-500 mt-1">{order.billing.phone}</p>}
                    {order.billing?.email && <p className="text-xs text-gray-500 break-all">{order.billing.email}</p>}
                  </div>
                </div>
              )}
              {billTo && shipTo && billTo.join(',') !== shipTo.join(',') && (
                <div className="flex gap-3 pt-3 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                    <Package size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Billing address</p>
                    <p className="text-sm text-gray-700 leading-relaxed mt-1">{billTo.join(', ')}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Customer note */}
          {order.customer_note && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Order note</p>
              <p className="text-sm text-gray-600 italic">{order.customer_note}</p>
            </div>
          )}
        </div>

        {/* Sticky footer action */}
        <div className="shrink-0 bg-white border-t border-gray-100 px-4 py-3 order-modal-footer">
          {tracking[0]?.tracking_link ? (
            <a
              href={tracking[0].tracking_link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#EE6348] text-white font-bold py-3 rounded-xl hover:bg-black transition"
            >
              <Truck size={16} /> Track Shipment
            </a>
          ) : (
            <button
              onClick={onClose}
              className="w-full bg-[#EE6348] text-white font-bold py-3 rounded-xl hover:bg-black transition"
            >
              Close
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes orderModalFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes orderModalSlide { from { transform: translateY(28px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        .order-modal-fade { animation: orderModalFade .2s ease-out; }
        .order-modal-sheet { animation: orderModalSlide .28s cubic-bezier(.22,1,.36,1); }
        .order-modal-footer { padding-bottom: max(0.75rem, env(safe-area-inset-bottom)); }
      `}</style>
    </div>
  );
};
