"use client";

import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface RevenueData {
  totalRevenue: number;
  totalCommission: number;
  totalPayouts: number;
  revenueByStore: {
    storeId: string;
    storeName: string;
    total: number;
    commission: number;
    orders: number;
    commissionRate: number;
    stripeOnboardingComplete: boolean;
  }[];
  dailyRevenue: {
    _id: string;
    total: number;
  }[];
  connectStatus: {
    storeId: string;
    storeName: string;
    active: boolean;
    commissionRate: number;
    hasStripeAccount: boolean;
    stripeOnboardingComplete: boolean;
  }[];
}

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/revenue");
      if (!res.ok) throw new Error("Failed to fetch data");
      const json = await res.json();
      setData(json);
    } catch (error) {
      toast.error("Could not load revenue data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Revenue Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Financial performance and analytics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Lifetime Revenue</p>
          <p className="mt-2 text-4xl font-bold text-gray-900">
            ${data.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Platform Commission Earned</p>
          <p className="mt-2 text-4xl font-bold text-green-600">
            ${data.totalCommission.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Paid Out to Stores</p>
          <p className="mt-2 text-4xl font-bold text-gray-900">
            ${data.totalPayouts.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Stores Table */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Top Performing Stores
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Store</th>
                  <th className="px-4 py-3 font-medium">Orders</th>
                  <th className="px-4 py-3 font-medium text-right">Revenue</th>
                  <th className="px-4 py-3 font-medium text-right">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.revenueByStore.length > 0 ? (
                  data.revenueByStore.map((store) => (
                    <tr key={store.storeId}>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {store.storeName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{store.orders}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        ${store.total.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-green-600">
                        ${store.commission.toLocaleString()}
                        <span className="ml-1 text-xs text-gray-400">
                          ({store.commissionRate}%)
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No sales yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Daily Revenue List (Simple Chart Placeholder) */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Recent Daily Revenue
          </h2>
          <div className="space-y-3">
            {data.dailyRevenue.length > 0 ? (
              data.dailyRevenue.map((day) => (
                <div key={day._id} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0">
                  <span className="text-sm text-gray-600">{day._id}</span>
                  <span className="font-medium text-gray-900">${day.total.toLocaleString()}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No data for the last 30 days</p>
            )}
          </div>
        </div>
      </div>

      {/* Connected Store Onboarding Status */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Stripe Connect Onboarding
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Store</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Commission Rate</th>
                <th className="px-4 py-3 font-medium">Store Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.connectStatus.length > 0 ? (
                data.connectStatus.map((store) => (
                  <tr key={store.storeId}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {store.storeName}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          store.stripeOnboardingComplete
                            ? "bg-green-100 text-green-700"
                            : store.hasStripeAccount
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {store.stripeOnboardingComplete
                          ? "Connected"
                          : store.hasStripeAccount
                            ? "Onboarding started"
                            : "Not connected"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{store.commissionRate}%</td>
                    <td className="px-4 py-3 text-gray-600">
                      {store.active ? "Active" : "Inactive"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No stores yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
