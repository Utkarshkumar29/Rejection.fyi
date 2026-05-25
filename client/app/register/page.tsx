'use client'

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import fetchApi from "@/lib/api"

const RegisterPage = () => {
    const router = useRouter()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0
    const passwordStrength = (() => {
        if (!password) return 0
        let s = 0
        if (password.length >= 8) s++
        if (/[A-Z]/.test(password)) s++
        if (/[0-9]/.test(password)) s++
        if (/[^A-Za-z0-9]/.test(password)) s++
        return s
    })()

    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength]
    const strengthColor = ['', '#e53e3e', '#ed8936', '#ecc94b', '#48bb78'][passwordStrength]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!passwordsMatch) return setError("Passwords do not match.")
        setError("")
        setIsLoading(true)
        try {
            const anonToken = typeof window !== 'undefined' ? localStorage.getItem("anonToken") : null
            const response = await fetchApi("/user/signUp", {
                method: "POST",
                body: JSON.stringify({ username, gmail: email, password, anonToken })
            })
            localStorage.setItem("token", response.token)
            if (anonToken) localStorage.removeItem("anonToken")
            router.push("/")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>

            {/* Left panel */}
            <div className="hidden lg:flex lg:w-[40%] flex-col justify-between p-12 relative overflow-hidden"
                style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>

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

                    <h2 className="text-2xl font-bold text-white mb-4 leading-tight">
                        Your story matters.<br />Share it safely.
                    </h2>
                    <p className="text-sm leading-relaxed mb-10" style={{ color: 'var(--text-secondary)' }}>
                        Create an account to track your submissions, claim anonymous entries, and get personalized insights based on your experience level and target companies.
                    </p>

                    {/* What you get */}
                    <div className="rounded-lg p-5 space-y-4"
                        style={{ background: 'rgba(26, 32, 53, 0.6)', border: '1px solid var(--border)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                            With an account
                        </p>
                        {[
                            "Track all your rejection submissions",
                            "Claim anonymous entries you made earlier",
                            "Get notified when your company is analyzed",
                            "See personalized pattern insights",
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--accent-blue)' }} />
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                <p className="relative z-10 text-xs" style={{ color: 'var(--text-muted)' }}>
                    © 2025 rejected.fyi · Built for professionals
                </p>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 overflow-y-auto">
                <div className={`max-w-md w-full mx-auto transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 mb-10 lg:hidden">
                        <div className="w-7 h-7 flex items-center justify-center rounded" style={{ background: 'var(--accent-red)' }}>
                            <span className="text-white text-xs font-bold">R</span>
                        </div>
                        <span className="text-white font-semibold tracking-tight">rejected.fyi</span>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Free forever. No credit card required.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="e.g. john_doe"
                                className="w-full text-sm px-4 py-3 rounded-lg outline-none transition-all duration-200 placeholder:text-slate-600"
                                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                            />
                        </div>

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
                                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                            />
                        </div>

                        {/* Password row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Password</label>
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Min 6 characters"
                                    className="w-full text-sm px-4 py-3 rounded-lg outline-none transition-all duration-200 placeholder:text-slate-600"
                                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                    Confirm
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="Repeat password"
                                    className="w-full text-sm px-4 py-3 rounded-lg outline-none transition-all duration-200 placeholder:text-slate-600"
                                    style={{
                                        background: 'var(--bg-card)',
                                        border: `1px solid ${confirmPassword ? (passwordsMatch ? 'rgba(72,187,120,0.4)' : 'rgba(229,62,62,0.4)') : 'var(--border)'}`,
                                        color: 'var(--text-primary)'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
                                    onBlur={(e) => e.target.style.borderColor = confirmPassword ? (passwordsMatch ? 'rgba(72,187,120,0.4)' : 'rgba(229,62,62,0.4)') : 'var(--border)'}
                                />
                            </div>
                        </div>

                        {/* Password strength */}
                        {password && (
                            <div className="space-y-1.5">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4].map((level) => (
                                        <div key={level} className="flex-1 h-1 rounded-full transition-all duration-300"
                                            style={{ background: level <= passwordStrength ? strengthColor : 'var(--border)' }} />
                                    ))}
                                </div>
                                <p className="text-xs" style={{ color: strengthColor }}>{strengthLabel} password</p>
                            </div>
                        )}

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
                            className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                            style={{ background: isLoading ? 'rgba(229, 62, 62, 0.5)' : 'var(--accent-red)', cursor: isLoading ? 'not-allowed' : 'pointer' }}
                            onMouseEnter={(e) => { if (!isLoading) (e.target as HTMLElement).style.filter = 'brightness(1.1)' }}
                            onMouseLeave={(e) => { (e.target as HTMLElement).style.filter = 'none' }}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Creating account...
                                </>
                            ) : "Create account"}
                        </button>
                    </form>

                    <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
                        Already have an account?{' '}
                        <a href="/login" className="font-medium" style={{ color: 'var(--accent-blue)' }}>Sign in</a>
                    </p>

                    <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
                        By creating an account you agree to our privacy-first policy. We never sell your data.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage