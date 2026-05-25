'use client'

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import fetchApi from "@/lib/api"

const LoginPage = () => {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)
        try {
            const response = await fetchApi("/user/login", {
                method: "POST",
                body: JSON.stringify({ gmail: email, password })
            })
            localStorage.setItem("token", response.token)
            router.push("/")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Invalid credentials. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>

            {/* Left panel — branding */}
            <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
                style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>

                {/* Subtle background texture */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, #e53e3e 1px, transparent 0)`,
                        backgroundSize: '32px 32px'
                    }}
                />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-8 h-8 flex items-center justify-center rounded"
                            style={{ background: 'var(--accent-red)' }}>
                            <span className="text-white text-sm font-bold">R</span>
                        </div>
                        <span className="text-white font-semibold text-lg tracking-tight">rejected.fyi</span>
                    </div>

                    <div className="mb-12">
                        <h2 className="text-3xl font-bold text-white leading-tight mb-4">
                            The transparency layer<br />hiring never wanted.
                        </h2>
                        <p style={{ color: 'var(--text-secondary)' }} className="text-base leading-relaxed">
                            Professionals anonymously share their rejection experiences so others can make informed decisions and companies can be held accountable.
                        </p>
                    </div>

                    {/* Trust indicators */}
                    <div className="space-y-4">
                        {[
                            { label: "Anonymous submissions", desc: "Your identity is never stored or shared" },
                            { label: "Real rejection data", desc: "Actual emails and genuine suspected reasons" },
                            { label: "AI pattern analysis", desc: "Understand trends across companies and roles" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5 shrink-0"
                                    style={{ background: 'rgba(72, 187, 120, 0.15)', border: '1px solid rgba(72, 187, 120, 0.3)' }}>
                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="#48bb78" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white text-sm font-medium">{item.label}</p>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        © 2025 rejected.fyi · Built for professionals
                    </p>
                </div>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
                <div className={`max-w-md w-full mx-auto transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 mb-10 lg:hidden">
                        <div className="w-7 h-7 flex items-center justify-center rounded"
                            style={{ background: 'var(--accent-red)' }}>
                            <span className="text-white text-xs font-bold">R</span>
                        </div>
                        <span className="text-white font-semibold tracking-tight">rejected.fyi</span>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Sign in to your account to continue
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                Email address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                                className="w-full text-sm px-4 py-3 rounded-lg outline-none transition-all duration-200 placeholder:text-slate-600"
                                style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text-primary)',
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                    Password
                                </label>
                                <button type="button" className="text-xs transition-colors"
                                    style={{ color: 'var(--accent-blue)' }}
                                    onMouseEnter={(e) => (e.target as HTMLElement).style.opacity = '0.7'}
                                    onMouseLeave={(e) => (e.target as HTMLElement).style.opacity = '1'}>
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Enter your password"
                                    className="w-full text-sm px-4 py-3 pr-12 rounded-lg outline-none transition-all duration-200 placeholder:text-slate-600"
                                    style={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border)',
                                        color: 'var(--text-primary)',
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    {showPassword ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-3 px-4 py-3 rounded-lg text-sm"
                                style={{ background: 'rgba(229, 62, 62, 0.08)', border: '1px solid rgba(229, 62, 62, 0.2)' }}>
                                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="#e53e3e" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span style={{ color: '#feb2b2' }}>{error}</span>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2"
                            style={{
                                background: isLoading ? 'rgba(229, 62, 62, 0.5)' : 'var(--accent-red)',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                            }}
                            onMouseEnter={(e) => { if (!isLoading) (e.target as HTMLElement).style.filter = 'brightness(1.1)' }}
                            onMouseLeave={(e) => { (e.target as HTMLElement).style.filter = 'none' }}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in...
                                </>
                            ) : "Sign in"}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or continue anonymously</span>
                        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                    </div>

                    <button
                        type="button"
                        onClick={() => router.push("/")}
                        className="w-full py-3 rounded-lg text-sm font-medium transition-all duration-200"
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-secondary)',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-light)')}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                    >
                        Browse without an account
                    </button>

                    <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
                        Don't have an account?{' '}
                        <a href="/register" className="font-medium transition-colors"
                            style={{ color: 'var(--accent-blue)' }}>
                            Create one
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default LoginPage