"use client";

import {
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface OrderItemType {
  _id: string;
  title: string;
  quantity: number;
  price: number;
  fulfillmentStatus?: string;
  transferId?: string;
  transferAmount?: number;
  legalException?: { processedAt?: string };
}

interface OrderType {
  _id: string;
  total: number;
  status: string;
  createdAt: string;
  userEmail: string;
  paymentIntentId?: string;
  storeId?: {
    name: string;
  };
  items: OrderItemType[];
}

const FULFILLMENT_LABELS: Record<string, string> = {
  pending: "Awaiting Dispatch",
  dispatched: "Dispatched",
  ready_for_pickup: "Ready for Pickup",
  delivered: "Delivered",
  picked_up: "Picked Up",
  issue_reported: "Issue Reported",
  resolved: "Resolved",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [legalRefundTarget, setLegalRefundTarget] = useState<{
    orderId: string;
    item: OrderItemType;
  } | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = filter === "ALL" ? "/api/admin/orders" : `/api/admin/orders?status=${filter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setOrders(data);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
      case "DELIVERED":
      case "PAID":
        return "bg-green-100 text-green-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Monitoring</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage incoming orders
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Status:</span>
          <select
            className="rounded-lg border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All Orders</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button onClick={fetchOrders} className="p-2 text-gray-400 hover:text-primary">
            <ArrowPathIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="w-8 px-2 py-3"></th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Store</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isExpanded = expandedOrderId === order._id;
                  return (
                    <Fragment key={order._id}>
                      <tr
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() =>
                          setExpandedOrderId(isExpanded ? null : order._id)
                        }
                      >
                        <td className="px-2 py-4 text-gray-400">
                          {isExpanded ? (
                            <ChevronDownIcon className="h-4 w-4" />
                          ) : (
                            <ChevronRightIcon className="h-4 w-4" />
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          #{order._id.slice(-6)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {order.userEmail}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {order.storeId?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {order.items.length} items
                          <span className="block max-w-[150px] truncate text-xs text-gray-400">
                            {order.items.map((i) => i.title).join(", ")}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            {order.items.filter((i) => i.fulfillmentStatus === "issue_reported").length > 0 && (
                              <Link
                                href="/admin/disputes"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-700 hover:bg-red-200"
                              >
                                {order.items.filter((i) => i.fulfillmentStatus === "issue_reported").length} in dispute
                              </Link>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="bg-gray-50/50 px-6 py-4">
                            {!order.paymentIntentId ? (
                              <p className="text-xs text-gray-400">
                                Legacy order — no per-item fulfillment data.
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {order.items.map((item) => {
                                  const eligible =
                                    ["delivered", "picked_up"].includes(
                                      item.fulfillmentStatus || "",
                                    ) &&
                                    !!item.transferId &&
                                    !item.legalException?.processedAt;
                                  const alreadyProcessed = !!item.legalException?.processedAt;

                                  return (
                                    <div
                                      key={item._id}
                                      className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div className="text-sm">
                                        <span className="font-medium text-gray-900">
                                          {item.title} × {item.quantity}
                                        </span>
                                        <span className="ml-2 text-xs text-gray-400">
                                          {FULFILLMENT_LABELS[item.fulfillmentStatus || "pending"] ||
                                            item.fulfillmentStatus}
                                          {item.transferAmount != null &&
                                            ` — €${item.transferAmount.toFixed(2)} transferred`}
                                        </span>
                                      </div>
                                      {alreadyProcessed ? (
                                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">
                                          Legal refund processed
                                        </span>
                                      ) : eligible ? (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setLegalRefundTarget({ orderId: order._id, item })
                                          }
                                          className="cursor-pointer rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                        >
                                          Process legal refund
                                        </button>
                                      ) : null}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {legalRefundTarget && (
        <LegalRefundModal
          orderId={legalRefundTarget.orderId}
          item={legalRefundTarget.item}
          onClose={() => setLegalRefundTarget(null)}
          onProcessed={() => {
            setLegalRefundTarget(null);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}

function LegalRefundModal({
  orderId,
  item,
  onClose,
  onProcessed,
}: {
  orderId: string;
  item: OrderItemType;
  onClose: () => void;
  onProcessed: () => void;
}) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = item.transferAmount ?? 0;

  const submit = async () => {
    if (!reason.trim()) {
      setError("A reason is required");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/orders/${orderId}/items/${item._id}/legal-refund`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: reason.trim() }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process refund");
      toast.success("Legal refund processed");
      onProcessed();
    } catch (err: any) {
      setError(err.message || "Failed to process refund");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-900">Process Legal Refund</h2>
        <p className="mt-1 text-sm text-gray-500">
          {item.title} × {item.quantity}
        </p>

        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          This will reverse the <strong>€{amount.toFixed(2)}</strong> already
          transferred to the seller and refund the buyer&apos;s card for the
          same amount. This is meant for rare, legally-required cases (EU
          withdrawal right, defect claims) — not routine disputes.
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Reason
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Buyer exercised their 14-day withdrawal right"
            rows={3}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            autoFocus
          />
        </div>

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={submit}
            className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {submitting ? "Processing..." : "Confirm Refund"}
          </button>
        </div>
      </div>
    </div>
  );
}
