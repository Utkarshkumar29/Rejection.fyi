"use client"
import fetchApi from "@/lib/api"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { io, Socket } from "socket.io-client"

const STAGE_LABELS: Record<string, string> = {
    resume: "Resume Screen",
    oa: "Online Assessment",
    technical: "Technical Interview",
    hr: "HR Round",
    final: "Final Round",
}

const STAGE_COLORS: Record<string, string> = {
    resume: "#fc8181",
    oa: "#f6ad55",
    technical: "#63b3ed",
    hr: "#b794f4",
    final: "#68d391",
}

interface Message {
    _id: string
    message: string
    user?: { username: string }
    createdAt: string
}

export default function CompanyProfile() {
    const { slug } = useParams()
    const router = useRouter()
    const [company, setCompany] = useState<any>(null)
    const [insights, setInsights] = useState<any>(null)
    const [trends, setTrends] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<"overview" | "discussion">("overview")

    // Discussion room state
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [socketConnected, setSocketConnected] = useState(false)
    const socketRef = useRef<Socket | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [messagesLoaded, setMessagesLoaded] = useState(false)

    const getCompany = async () => {
        try {
            const response = await fetchApi(`company/${slug}`, { method: "GET" })
            setCompany(response.company)
        } catch (error) { console.log(error) }
    }

    const getCompanyInsights = async () => {
        try {
            const response = await fetchApi(`company/${slug}/insights`, { method: "GET" })
            setInsights(response.insights)
        } catch (error) { console.log(error) }
    }

    const getCompanyTrends = async () => {
        try {
            const response = await fetchApi(`company/${slug}/trends`, { method: "GET" })
            setTrends(response.text)
        } catch (error) { console.log(error) }
    }

    const getMessages = async (companyId: string) => {
        try {
            const response = await fetchApi(`messages/${companyId}`, { method: "GET" })
            if (response.messages) {
                setMessages(response.messages)
            }
        } catch (error) { console.log("Failed to load messages:", error) }
    }

    useEffect(() => {
        Promise.all([getCompany(), getCompanyInsights(), getCompanyTrends()])
            .finally(() => setLoading(false))
    }, [])

    // Load existing messages when discussion tab is opened
    useEffect(() => {
        if (activeTab === "discussion") {
            getMessages(company?._id)
        }
    }, [activeTab])

    // Socket.io discussion room
    useEffect(() => {
        const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'
        const socket = io(apiBase)
        socketRef.current = socket

        socket.on("connect", () => {
            setSocketConnected(true)
            socket.emit("joinRoom", { slug, user: null })
        })

        socket.on("newMessage", (msg: Message) => {
            setMessages(prev => {
                // Avoid adding duplicate messages
                const isDuplicate = prev.some(m => m._id === msg._id)
                return isDuplicate ? prev : [...prev, msg]
            })
        })

        socket.on("disconnect", () => setSocketConnected(false))

        return () => { socket.disconnect() }
    }, [slug])

    // Load messages when discussion tab is active
    useEffect(() => {
        if (activeTab === "discussion" && company?._id && !messagesLoaded) {
            getMessages(company._id)
            setMessagesLoaded(true)
        }
    }, [activeTab, company, messagesLoaded])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const sendMessage = () => {
        if (!newMessage.trim() || !socketRef.current) return
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null
        
        // Only send user info if logged in (token will be verified server-side)
        socketRef.current.emit("sendMessage", {
            message: newMessage.trim(),
            slug,
            company: { _id: company?._id },
            user: token ? { _id: token } : null  // Send null for anonymous users
        })
        setNewMessage("")
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const timeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return "just now"
        if (mins < 60) return `${mins}m ago`
        return `${Math.floor(mins / 60)}h ago`
    }

    const totalStageRejections = company
        ? Object.values(company.byStage || {}).reduce((a: number, b) => a + (b as number), 0)
        : 0

    if (loading) {
        return (
            <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }} className="flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto"
                        style={{ borderColor: 'var(--accent-red)', borderTopColor: 'transparent' }} />
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading company data...</p>
                </div>
            </div>
        )
    }

    if (!company) {
        return (
            <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }} className="flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white font-semibold mb-2">Company not found</p>
                    <button onClick={() => router.push("/rejections")} className="text-sm cursor-pointer"
                        style={{ color: 'var(--accent-red)' }}>← Back to feed</button>
                </div>
            </div>
        )
    }

    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>

            {/* Navbar */}
            <nav className="sticky top-0 z-20 backdrop-blur-md"
                style={{ background: 'rgba(15, 17, 23, 0.9)', borderBottom: '1px solid var(--border)' }}>
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
                    <button onClick={() => router.push("/")}
                        className="flex items-center gap-2 text-sm transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to feed
                    </button>
                    <span style={{ color: 'var(--border)' }}>·</span>
                    <span className="text-sm font-medium text-white">{company.name}</span>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 py-8">

                {/* Company header */}
                <div className="rounded-xl p-6 mb-6"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                                style={{ background: 'var(--bg-hover)' }}>
                                {company.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">{company.name}</h1>
                                <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                    {company.totalRejections} rejection{company.totalRejections !== 1 ? 's' : ''} recorded
                                </p>
                            </div>
                        </div>

                        {/* Key stats */}
                        <div className="flex items-center gap-6 flex-wrap">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{company.totalRejections}</div>
                                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Total rejections</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{company.avgYoe?.toFixed(1) || '—'}</div>
                                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Avg YOE rejected</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold" style={{ color: 'var(--accent-red)' }}>
                                    {company.byStage
                                        ? Object.entries(company.byStage).sort((a: any, b: any) => b[1] - a[1])[0]?.[0]
                                            ? STAGE_LABELS[Object.entries(company.byStage).sort((a: any, b: any) => b[1] - a[1])[0][0]] || '—'
                                            : '—'
                                        : '—'}
                                </div>
                                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Most common stage</div>
                            </div>
                        </div>
                    </div>

                    {/* Stage breakdown */}
                    {company.byStage && (
                        <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                            <p className="text-xs font-semibold uppercase tracking-wider mb-4"
                                style={{ color: 'var(--text-muted)' }}>Rejection by stage</p>
                            <div className="space-y-3">
                                {Object.entries(company.byStage).map(([stage, count]: [string, any]) => {
                                    const pct = totalStageRejections > 0 ? (count / totalStageRejections) * 100 : 0
                                    return (
                                        <div key={stage}>
                                            <div className="flex items-center justify-between text-xs mb-1.5">
                                                <span style={{ color: 'var(--text-secondary)' }}>{STAGE_LABELS[stage] || stage}</span>
                                                <span className="font-medium" style={{ color: STAGE_COLORS[stage] || 'var(--text-secondary)' }}>
                                                    {count} ({pct.toFixed(0)}%)
                                                </span>
                                            </div>
                                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
                                                <div className="h-full rounded-full transition-all duration-700"
                                                    style={{ width: `${pct}%`, background: STAGE_COLORS[stage] || 'var(--accent-red)' }} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 p-1 rounded-lg mb-6 w-fit"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    {(['overview', 'discussion'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className="px-5 py-2 rounded-md text-sm font-medium transition-all capitalize cursor-pointer"
                            style={{
                                background: activeTab === tab ? 'var(--bg-card)' : 'transparent',
                                color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
                                border: activeTab === tab ? '1px solid var(--border)' : '1px solid transparent'
                            }}>
                            {tab === 'discussion' ? (
                                <span className="flex items-center gap-2">
                                    Discussion
                                    {socketConnected && <span className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                                </span>
                            ) : 'Overview'}
                        </button>
                    ))}
                </div>

                {/* OVERVIEW TAB */}
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* Skills insights */}
                        <div className="lg:col-span-5">
                            <div className="rounded-xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                <h2 className="font-semibold text-white mb-1">Top skills on rejected resumes</h2>
                                <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
                                    Most common skills listed by rejected candidates
                                </p>

                                {insights && insights.length > 0 ? (
                                    <div className="space-y-3">
                                        {insights.slice(0, 8).map((item: any, i: number) => {
                                            const maxCount = insights[0]?.count || 1
                                            const pct = (item.count / maxCount) * 100
                                            return (
                                                <div key={i}>
                                                    <div className="flex items-center justify-between text-xs mb-1.5">
                                                        <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                                                            {item._id}
                                                        </span>
                                                        <span style={{ color: 'var(--text-muted)' }}>{item.count} candidates</span>
                                                    </div>
                                                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
                                                        <div className="h-full rounded-full transition-all duration-700"
                                                            style={{ width: `${pct}%`, background: 'var(--accent-blue)' }} />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                        Not enough data yet to show skill patterns.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Gemini AI trends */}
                        <div className="lg:col-span-7">
                            <div className="rounded-xl p-6 h-full" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">🤖</span>
                                    <h2 className="font-semibold text-white">AI Trend Analysis</h2>
                                    <span className="text-xs px-2 py-0.5 rounded-full font-medium ml-auto"
                                        style={{ background: 'rgba(66, 153, 225, 0.1)', border: '1px solid rgba(66, 153, 225, 0.2)', color: '#63b3ed' }}>
                                        Gemini powered
                                    </span>
                                </div>
                                <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
                                    Patterns identified from rejection messages and suspected reasons
                                </p>

                                {trends ? (
                                    <div className="prose prose-sm max-w-none">
                                        <div className="text-sm leading-relaxed whitespace-pre-wrap"
                                            style={{ color: 'var(--text-secondary)' }}>
                                            {trends}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <span className="text-3xl mb-3">📊</span>
                                        <p className="text-sm font-medium text-white mb-1">Not enough data yet</p>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                            AI analysis requires at least a few rejection entries for this company.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* DISCUSSION TAB */}
                {activeTab === "discussion" && (
                    <div className="rounded-xl overflow-hidden"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>

                        {/* Discussion header */}
                        <div className="px-6 py-4 flex items-center justify-between"
                            style={{ borderBottom: '1px solid var(--border)' }}>
                            <div>
                                <h2 className="font-semibold text-white">Discussion</h2>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                    Share experiences and ask questions about {company.name}
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs"
                                style={{ color: socketConnected ? '#68d391' : 'var(--text-muted)' }}>
                                <span className={`w-1.5 h-1.5 rounded-full ${socketConnected ? 'bg-green-400 animate-pulse' : 'bg-zinc-600'}`} />
                                {socketConnected ? 'Connected' : 'Connecting...'}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="h-96 overflow-y-auto p-6 space-y-4">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <span className="text-3xl mb-3">💬</span>
                                    <p className="text-sm font-medium text-white mb-1">No messages yet</p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                        Be the first to start the discussion about {company.name}
                                    </p>
                                </div>
                            ) : (
                                messages.map((msg, i) => (
                                    <div key={msg._id || i} className="flex items-start gap-3">
                                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                            style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                                            {msg.user?.username?.charAt(0).toUpperCase() || 'A'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-medium text-white">
                                                    {msg.user?.username || 'Anonymous'}
                                                </span>
                                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    {timeAgo(msg.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                                {msg.message}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message input */}
                        <div className="px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
                            <div className="flex items-center gap-3">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Share your experience or ask a question... (Enter to send)"
                                    rows={2}
                                    className="flex-1 text-sm px-4 py-3 rounded-lg outline-none resize-none placeholder:text-slate-600"
                                    style={{
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border)',
                                        color: 'var(--text-primary)'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                                />
                                <button onClick={sendMessage}
                                    disabled={!newMessage.trim() || !socketConnected}
                                    className="px-4 py-3 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-40"
                                    style={{ background: 'var(--accent-red)' }}
                                    onMouseEnter={(e) => { if (newMessage.trim()) (e.currentTarget.style.filter = 'brightness(1.1)') }}
                                    onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}>
                                    Send
                                </button>
                            </div>
                            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                                Messages are public. Be respectful and professional.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}