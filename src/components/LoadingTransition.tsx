import { useEffect, useState } from 'react'
import logoSvg from '../../logo.svg'

interface LoadingTransitionProps {
    message?: string
}

const LoadingTransition = ({ message = 'Preparing your dashboard...' }: LoadingTransitionProps) => {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        // Smoothly fill the progress bar over 2 seconds
        const duration = 2000
        const interval = 20
        const increment = (100 / duration) * interval

        const timer = setInterval(() => {
            setProgress(prev => {
                const next = prev + increment
                return next >= 100 ? 100 : next
            })
        }, interval)

        return () => clearInterval(timer)
    }, [])

    return (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
            {/* Background effects */}
            <div className="absolute inset-0">
                <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-primary-500/20 rounded-full blur-[150px] animate-pulse"></div>
                <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]"></div>
            </div>

            <div className="relative z-10 text-center">
                {/* Logo */}
                <div className="mb-12">
                    <img src={logoSvg} alt="Gascon" className="h-12 w-auto mx-auto" />
                </div>

                {/* Loading message */}
                <p className="text-white/80 text-xl font-medium mb-8">
                    {message}
                </p>

                {/* Progress bar */}
                <div className="w-96 max-w-full mx-auto">
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                        <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-75 ease-linear shadow-[0_0_20px_rgba(34,197,94,0.5)]"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-white/60 text-sm mt-4 font-medium">{Math.round(progress)}%</p>
                </div>
            </div>

            <style>{`
                @keyframes loading {
                    0% {
                        width: 0%;
                        margin-left: 0%;
                    }
                    50% {
                        width: 75%;
                        margin-left: 12.5%;
                    }
                    100% {
                        width: 0%;
                        margin-left: 100%;
                    }
                }
            `}</style>
        </div>
    )
}

export default LoadingTransition
