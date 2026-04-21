import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ReactNode } from 'react'
import LoadingTransition from './LoadingTransition'

interface ProtectedRouteProps {
    children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading } = useAuth()
    const location = useLocation()

    if (isLoading) {
        return <LoadingTransition message="Verifying authentication..." />
    }

    if (!isAuthenticated) {
        return <Navigate to={`/login?redirect=${location.pathname}`} replace />
    }

    return <>{children}</>
}

export default ProtectedRoute
