import { useAuth } from '@/auth/AuthContext'
import { BuilderDashboard } from '@/app/dashboard/BuilderDashboard'
import { OwnerDashboard } from '@/app/dashboard/OwnerDashboard'
import { InvestorDashboard } from '@/app/dashboard/InvestorDashboard'
import { BusinessOwnerDashboard } from '@/app/dashboard/BusinessOwnerDashboard'
import { AdminDashboard } from '@/app/dashboard/AdminDashboard'

/** Routes an authenticated member to the right desk for their role. */
export function RoleHome() {
  const { user } = useAuth()
  if (!user) return null

  switch (user.role) {
    case 'builder':
      return <BuilderDashboard />
    case 'landowner':
      return <OwnerDashboard />
    case 'investor':
      return <InvestorDashboard />
    case 'business_owner':
      return <BusinessOwnerDashboard />
    case 'admin':
      return <AdminDashboard />
    default:
      return null
  }
}
