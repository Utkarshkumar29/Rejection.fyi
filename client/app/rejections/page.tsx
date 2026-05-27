'use client'

import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import fetchApi from "@/lib/api"

interface Rejection {
    _id: string
    companyName: string
    role: string
    stage: string
    yoe: number
    location: string
    skills: string[]
    suspectedReason: string
    rejectionMessage: string
    createdAt: string
}

const STAGE_LABELS: Record<string, string> = {
    resume: 'Resume Screen',
    oa: 'Online Assessment',
    technical: 'Technical Interview',
    hr: 'HR Round',
    final: 'Final Round',
}

const STAGE_COLORS: Record<string, string> = {
    resume: 'rgba(229, 62, 62, 0.12)',
    oa: 'rgba(237, 137, 54, 0.12)',
    technical: 'rgba(66, 153, 225, 0.12)',
    hr: 'rgba(128, 90, 213, 0.12)',
    final: 'rgba(72, 187, 120, 0.12)',
}

const STAGE_TEXT: Record<string, string> = {
    resume: '#fc8181',
    oa: '#f6ad55',
    technical: '#63b3ed',
    hr: '#b794f4',
    final: '#68d391',
}

const FeedPage = () => {
    const router = useRouter()
    const [rejections, setRejections] = useState<Rejection[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [activeView, setActiveView] = useState<'feed' | 'submit'>('feed')
    const [token, setToken] = useState<string | null>(null)
    const [liveCount, setLiveCount] = useState(0)

    // Submit form state
    const [form, setForm] = useState({
        companyName: '', role: '', stage: 'resume',
        yoe: '', location: '', skills: '',
        suspectedReason: '', rejectionMessage: ''
    })
    const [submitting, setSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [submitError, setSubmitError] = useState("")

    // Filter state
    const [filterStage, setFilterStage] = useState("")
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setToken(localStorage.getItem("token"))
        }
    }, [])

    const loadFeed = async (p: number) => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(p), limit: '15' })
            if (filterStage) params.set('stage', filterStage)
            const data = await fetchApi(`rejections?${params}`)
            const payload = data.data || data   // unwrap if wrapped, use directly if not
            setRejections(payload?.rejections || [])
            setTotalPages(payload?.totalPages || 1)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadFeed(page)
    }, [page, filterStage])

    // SSE live feed
    useEffect(() => {
        const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('api', '') || 'http://localhost:5000'
        let es: EventSource
        try {
            es = new EventSource(`${apiBase}api/rejections/stream`)
            es.onmessage = (e) => {
                const newItem = JSON.parse(e.data)
                if (newItem?._id) {
                    setRejections(prev => [newItem, ...prev.slice(0, 14)])
                    setLiveCount(c => c + 1)
                }
            }
        } catch { }
        return () => es?.close()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setSubmitError("")
        try {
            const anonToken = typeof window !== 'undefined' ? localStorage.getItem("anonToken") : null
            await fetchApi("rejections", {
                method: "POST",
                body: JSON.stringify({
                    ...form,
                    yoe: Number(form.yoe),
                    skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
                    anonymousId: anonToken
                })
            })
            setSubmitSuccess(true)
            setForm({ companyName: '', role: '', stage: 'resume', yoe: '', location: '', skills: '', suspectedReason: '', rejectionMessage: '' })
            setTimeout(() => {
                setSubmitSuccess(false)
                setActiveView('feed')
                loadFeed(1)
            }, 2000)
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : "Submission failed")
        } finally {
            setSubmitting(false)
        }
    }

    const timeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime()
        const mins = Math.floor(diff / 60000)
        const hrs = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)
        if (mins < 1) return 'just now'
        if (mins < 60) return `${mins}m ago`
        if (hrs < 24) return `${hrs}h ago`
        return `${days}d ago`
    }

    const filteredRejections = searchQuery
        ? rejections.filter(r =>
            r.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.role.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : rejections

    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>

            {/* Navbar */}
            <nav style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}
                className="sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push('/')}>
                            <div className="w-7 h-7 rounded flex items-center justify-center"
                                style={{ background: 'var(--accent-red)' }}>
                                <span className="text-white text-xs font-bold">R</span>
                            </div>
                            <span className="font-semibold text-white tracking-tight">rejected.fyi</span>
                        </div>

                        {liveCount > 0 && (
                            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                                style={{ background: 'rgba(72, 187, 120, 0.1)', border: '1px solid rgba(72, 187, 120, 0.2)', color: '#68d391' }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                {liveCount} new
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {token ? (
                            <button onClick={() => { localStorage.removeItem('token'); setToken(null) }}
                                className="text-sm px-4 py-2 rounded-lg transition-all"
                                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                                Sign out
                            </button>
                        ) : (
                            <>
                                <a href="/login" className="text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>Sign in</a>
                                <a href="/register" className="text-sm px-4 py-2 rounded-lg font-medium text-white transition-all"
                                    style={{ background: 'var(--accent-red)' }}>
                                    Get started
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Main content */}
                    <div className="lg:col-span-8">

                        {/* Tab bar */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-1 p-1 rounded-lg"
                                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                                {(['feed', 'submit'] as const).map(view => (
                                    <button key={view} onClick={() => setActiveView(view)}
                                        className="px-4 py-2 rounded-md text-sm font-medium transition-all capitalize"
                                        style={{
                                            background: activeView === view ? 'var(--bg-card)' : 'transparent',
                                            color: activeView === view ? 'var(--text-primary)' : 'var(--text-secondary)',
                                            border: activeView === view ? '1px solid var(--border)' : '1px solid transparent'
                                        }}>
                                        {view === 'feed' ? 'Rejection Feed' : 'Share Your Story'}
                                    </button>
                                ))}
                            </div>

                            {activeView === 'feed' && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Search company or role..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="text-sm px-3 py-2 rounded-lg outline-none w-48 placeholder:text-slate-600"
                                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                    />
                                    <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)}
                                        className="text-sm px-3 py-2 rounded-lg outline-none"
                                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                        <option value="">All stages</option>
                                        {Object.entries(STAGE_LABELS).map(([k, v]) => (
                                            <option key={k} value={k}>{v}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* FEED VIEW */}
                        {activeView === 'feed' && (
                            <div className="space-y-3">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <div key={i} className="rounded-xl p-5 animate-pulse"
                                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', height: '140px' }} />
                                    ))
                                ) : filteredRejections.length === 0 ? (
                                    <div className="text-center py-16 rounded-xl"
                                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                        <p className="text-lg font-semibold text-white mb-2">No rejections found</p>
                                        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                                            Be the first to share your experience
                                        </p>
                                        <button onClick={() => setActiveView('submit')}
                                            className="text-sm px-5 py-2.5 rounded-lg font-medium text-white"
                                            style={{ background: 'var(--accent-red)' }}>
                                            Share your story
                                        </button>
                                    </div>
                                ) : (
                                    filteredRejections.map((item) => (
                                        <div key={item._id}
                                            className="rounded-xl p-5 transition-all duration-200 cursor-pointer group"
                                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
                                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}>

                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div className="flex items-start gap-3">
                                                    {/* Company avatar */}
                                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                                                        style={{ background: 'var(--bg-hover)' }}>
                                                        {item.companyName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-semibold text-white">{item.companyName}</span>
                                                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>·</span>
                                                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.role}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                            <span className="text-xs px-2 py-0.5 rounded-md font-medium"
                                                                style={{
                                                                    background: STAGE_COLORS[item.stage] || 'var(--bg-hover)',
                                                                    color: STAGE_TEXT[item.stage] || 'var(--text-secondary)'
                                                                }}>
                                                                {STAGE_LABELS[item.stage] || item.stage}
                                                            </span>
                                                            {item.yoe !== undefined && (
                                                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                                    {item.yoe} YOE
                                                                </span>
                                                            )}
                                                            {item.location && (
                                                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                                    · {item.location}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                                                    {timeAgo(item.createdAt)}
                                                </span>
                                            </div>

                                            {/* Rejection message */}
                                            {item.rejectionMessage && (
                                                <div className="mb-3 px-4 py-3 rounded-lg text-sm italic leading-relaxed"
                                                    style={{ background: 'rgba(255,255,255,0.03)', borderLeft: '3px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                                                    "{item.rejectionMessage.length > 200 ? item.rejectionMessage.slice(0, 200) + '...' : item.rejectionMessage}"
                                                </div>
                                            )}

                                            {/* Suspected reason */}
                                            {item.suspectedReason && (
                                                <div className="mb-3">
                                                    <span className="text-xs font-medium px-2 py-0.5 rounded"
                                                        style={{ background: 'rgba(229, 62, 62, 0.08)', color: '#fc8181' }}>
                                                        Suspected reason
                                                    </span>
                                                    <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                                        {item.suspectedReason}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Skills */}
                                            {item.skills?.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-3">
                                                    {item.skills.map((skill, i) => (
                                                        <span key={i} className="text-xs px-2 py-0.5 rounded"
                                                            style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}

                                {/* Pagination */}
                                {!loading && totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-3 pt-4">
                                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                            className="px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-30"
                                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                            Previous
                                        </button>
                                        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                            {page} of {totalPages}
                                        </span>
                                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                            className="px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-30"
                                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SUBMIT VIEW */}
                        {activeView === 'submit' && (
                            <div className="rounded-xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                <h2 className="text-lg font-semibold text-white mb-1">Share your rejection</h2>
                                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                                    Your submission is anonymous. Help others understand what companies are really looking for.
                                </p>

                                {submitSuccess ? (
                                    <div className="text-center py-12">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                                            style={{ background: 'rgba(72, 187, 120, 0.1)', border: '1px solid rgba(72, 187, 120, 0.3)' }}>
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#48bb78" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <p className="text-white font-semibold mb-1">Submission received</p>
                                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Thank you for contributing to the community.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { label: 'Company name', field: 'companyName', placeholder: 'e.g. Google', required: true },
                                                { label: 'Role applied for', field: 'role', placeholder: 'e.g. Senior Frontend Engineer', required: true },
                                            ].map(({ label, field, placeholder, required }) => (
                                                <div key={field}>
                                                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
                                                    <input type="text" required={required} placeholder={placeholder}
                                                        value={form[field as keyof typeof form]}
                                                        onChange={(e) => setForm(f => ({ ...f, [field]: e.target.value }))}
                                                        className="w-full text-sm px-3 py-2.5 rounded-lg outline-none placeholder:text-slate-600"
                                                        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                                        onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
                                                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Stage rejected at</label>
                                                <select value={form.stage} onChange={(e) => setForm(f => ({ ...f, stage: e.target.value }))}
                                                    className="w-full text-sm px-3 py-2.5 rounded-lg outline-none"
                                                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                                                    {Object.entries(STAGE_LABELS).map(([k, v]) => (
                                                        <option key={k} value={k}>{v}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Years of experience</label>
                                                <input type="number" min="0" max="40" required placeholder="e.g. 2"
                                                    value={form.yoe}
                                                    onChange={(e) => setForm(f => ({ ...f, yoe: e.target.value }))}
                                                    className="w-full text-sm px-3 py-2.5 rounded-lg outline-none placeholder:text-slate-600"
                                                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
                                                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Location</label>
                                                <input type="text" placeholder="e.g. Bangalore"
                                                    value={form.location}
                                                    onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
                                                    className="w-full text-sm px-3 py-2.5 rounded-lg outline-none placeholder:text-slate-600"
                                                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
                                                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                                Skills on your resume (comma separated)
                                            </label>
                                            <input type="text" placeholder="React, TypeScript, Node.js, AWS"
                                                value={form.skills}
                                                onChange={(e) => setForm(f => ({ ...f, skills: e.target.value }))}
                                                className="w-full text-sm px-3 py-2.5 rounded-lg outline-none placeholder:text-slate-600"
                                                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                                onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
                                                onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                                What do you think was the real reason? <span style={{ color: 'var(--accent-red)' }}>*</span>
                                            </label>
                                            <textarea required rows={3} placeholder="e.g. I think they wanted someone with more backend experience. The job description mentioned Node but all technical questions were about system design..."
                                                value={form.suspectedReason}
                                                onChange={(e) => setForm(f => ({ ...f, suspectedReason: e.target.value }))}
                                                className="w-full text-sm px-3 py-2.5 rounded-lg outline-none resize-none placeholder:text-slate-600"
                                                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                                onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
                                                onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                                Paste the rejection email (optional)
                                            </label>
                                            <textarea rows={4} placeholder="Paste the actual rejection email you received..."
                                                value={form.rejectionMessage}
                                                onChange={(e) => setForm(f => ({ ...f, rejectionMessage: e.target.value }))}
                                                className="w-full text-sm px-3 py-2.5 rounded-lg outline-none resize-none placeholder:text-slate-600"
                                                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                                onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
                                                onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                                        </div>

                                        {submitError && (
                                            <div className="text-sm px-4 py-3 rounded-lg"
                                                style={{ background: 'rgba(229, 62, 62, 0.08)', border: '1px solid rgba(229, 62, 62, 0.2)', color: '#fc8181' }}>
                                                {submitError}
                                            </div>
                                        )}

                                        <button type="submit" disabled={submitting}
                                            className="w-full py-3 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2"
                                            style={{ background: submitting ? 'rgba(229, 62, 62, 0.5)' : 'var(--accent-red)', cursor: submitting ? 'not-allowed' : 'pointer' }}>
                                            {submitting ? 'Submitting...' : 'Submit anonymously'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-4">

                        {/* About card */}
                        <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                            <h3 className="font-semibold text-white mb-2">About rejected.fyi</h3>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                A community-driven platform where professionals share real rejection data to surface patterns and create transparency in hiring.
                            </p>
                            <div className="mt-4 pt-4 grid grid-cols-2 gap-3" style={{ borderTop: '1px solid var(--border)' }}>
                                {[
                                    { label: 'Anonymous', icon: '🔒' },
                                    { label: 'Free forever', icon: '🎁' },
                                    { label: 'Real data', icon: '📊' },
                                    { label: 'AI insights', icon: '🤖' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                                        <span>{item.icon}</span>
                                        <span>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA if not logged in */}
                        {!token && (
                            <div className="rounded-xl p-5"
                                style={{ background: 'linear-gradient(135deg, rgba(229,62,62,0.1) 0%, rgba(26,32,53,1) 100%)', border: '1px solid rgba(229,62,62,0.2)' }}>
                                <h3 className="font-semibold text-white mb-2">Create an account</h3>
                                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                                    Track your submissions and get personalized insights.
                                </p>
                                <a href="/register"
                                    className="block text-center text-sm py-2.5 rounded-lg font-medium text-white"
                                    style={{ background: 'var(--accent-red)' }}>
                                    Get started free
                                </a>
                            </div>
                        )}

                        {/* Filter by stage */}
                        <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                            <h3 className="font-semibold text-white mb-3 text-sm">Filter by stage</h3>
                            <div className="space-y-1">
                                <button onClick={() => setFilterStage('')}
                                    className="w-full text-left text-sm px-3 py-2 rounded-lg transition-all"
                                    style={{
                                        background: filterStage === '' ? 'var(--bg-hover)' : 'transparent',
                                        color: filterStage === '' ? 'var(--text-primary)' : 'var(--text-secondary)'
                                    }}>
                                    All stages
                                </button>
                                {Object.entries(STAGE_LABELS).map(([k, v]) => (
                                    <button key={k} onClick={() => setFilterStage(k)}
                                        className="w-full text-left text-sm px-3 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer"
                                        style={{
                                            background: filterStage === k ? 'var(--bg-hover)' : 'transparent',
                                            color: filterStage === k ? STAGE_TEXT[k] : 'var(--text-secondary)'
                                        }}>
                                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: STAGE_TEXT[k] }} />
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FeedPage