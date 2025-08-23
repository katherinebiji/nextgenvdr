"use client"

import { useAuth } from "./auth-provider"
import { BuyerDashboard } from "./buyer-dashboard"
import { SellerDashboard } from "./seller-dashboard"
import { Header } from "./header"

export function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {user?.role === "buyer" ? <BuyerDashboard /> : <SellerDashboard />}
      </main>
    </div>
  )
}
