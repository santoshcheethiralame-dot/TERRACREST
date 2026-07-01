import type { ReactNode } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { Landing } from '@/app/Landing'
import { Login } from '@/app/Login'
import { RoleHome } from '@/app/RoleHome'
import { ListingDetail } from '@/app/listing/ListingDetail'
import { Studio } from '@/app/studio/Studio'
import { ProtectedRoute } from '@/auth/ProtectedRoute'

const guard = (element: ReactNode) => <ProtectedRoute>{element}</ProtectedRoute>

export const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/app', element: guard(<RoleHome />) },
  { path: '/listing/:id', element: guard(<ListingDetail />) },
  { path: '/studio', element: guard(<Studio />) },
  { path: '/studio/:id', element: guard(<Studio />) },
])
