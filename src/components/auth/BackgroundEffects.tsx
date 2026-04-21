export const BackgroundEffects = () => {
    return (
        <div className="absolute inset-0">
            <div className="absolute top-40 left-20 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-40 right-20 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]"></div>
        </div>
    )
}
