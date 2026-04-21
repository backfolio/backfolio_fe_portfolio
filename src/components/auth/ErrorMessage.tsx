interface ErrorMessageProps {
    message: string
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
    if (!message) return null

    return (
        <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-5 py-4 rounded-2xl mb-6 font-medium">
            <div className="flex items-center gap-3">
                <span className="text-lg">⚠️</span>
                {message}
            </div>
        </div>
    )
}
