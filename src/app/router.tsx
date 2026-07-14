import type { ReactNode } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { Landing } from '@/app/Landing'
import { Login } from '@/app/Login'
import { RoleHome } from '@/app/RoleHome'
import { ListingDetail } from '@/app/listing/ListingDetail'
import { Studio } from '@/app/studio/Studio'
import { ProtectedRoute } from '@/auth/ProtectedRoute'
import type { Role } from '@/domain/types'

const guard = (element: ReactNode) => <ProtectedRoute>{element}</ProtectedRoute>
const restrict = (element: ReactNode, roles: Role[]) => <ProtectedRoute roles={roles}>{element}</ProtectedRoute>

export const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/app', element: guard(<RoleHome />) },
  { path: '/listing/:id', element: guard(<ListingDetail />) },
  // The Feasibility Studio is a builder's tool — owners and investors have no use for it.
  { path: '/studio', element: restrict(<Studio />, ['builder', 'admin']) },
  { path: '/studio/:id', element: restrict(<Studio />, ['builder', 'admin']) },
])
