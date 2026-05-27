"use client"
import fetchApi from "@/lib/api"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

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

export default function ProfilePage() {
    const router = useRouter()
    const [rejections, setRejections] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null
        if (!token) {
            router.push("/login")
            return
        }

        Promise.all([
            fetchApi("/user/me", { method: "GET" }),
            fetchApi("rejections/mine", { method: "GET" })
        ]).then(([meRes, rejectionsRes]) => {
            setUser(meRes.user)
            setRejections(rejectionsRes.rejections || [])
        }).catch(() => {
            //router.push("/login")
        }).finally(() => setLoading(false))
    }, [])

    const timeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime()
        const days = Math.floor(diff / 86400000)
        if (days === 0) return "Today"
        if (days === 1) return "Yesterday"
        return `${days} days ago`
    }

    if (loading) {
        return (
            <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }} className="flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: 'var(--accent-red)', borderTopColor: 'transparent' }} />
            </div>
        )
    }

    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>

            {/* Navbar */}
            <nav className="sticky top-0 z-20 backdrop-blur-md"
                style={{ background: 'rgba(15, 17, 23, 0.9)', borderBottom: '1px solid var(--border)' }}>
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push("/")}>
                        <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: 'var(--accent-red)' }}>
                            <span className="text-white text-xs font-bold">R</span>
                        </div>
                        <span className="font-semibold text-white tracking-tight">rejected.fyi</span>
                    </div>
                    <button onClick={() => {
                        localStorage.removeItem("token")
                        router.push("/login")
                    }} className="text-sm px-4 py-2 rounded-lg transition-all"
                        style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                        Sign out
                    </button>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-6 py-10">

                {/* Profile header */}
                <div className="rounded-xl p-6 mb-8"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl"
                            style={{ background: 'var(--accent-red)' }}>
                            {user?.username?.charAt(0).toUpperCase() || user?.gmail?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">{user?.username || 'Anonymous'}</h1>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.gmail}</p>
                        </div>
                        <div className="ml-auto text-center">
                            <div className="text-2xl font-bold text-white">{rejections.length}</div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Submissions</div>
                        </div>
                    </div>
                </div>

                {/* Submissions */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="font-semibold text-white">Your submissions</h2>
                    <button onClick={() => router.push("/rejections")}
                        className="text-sm px-4 py-2 rounded-lg font-medium text-white"
                        style={{ background: 'var(--accent-red)' }}>
                        Add new
                    </button>
                </div>

                {rejections.length === 0 ? (
                    <div className="rounded-xl p-12 text-center"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <span className="text-4xl mb-4 block">📭</span>
                        <p className="font-semibold text-white mb-2">No submissions yet</p>
                        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                            Share your first rejection to help the community.
                        </p>
                        <button onClick={() => router.push("/rejections")}
                            className="text-sm px-5 py-2.5 rounded-lg font-medium text-white"
                            style={{ background: 'var(--accent-red)' }}>
                            Submit a rejection
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {rejections.map((item) => (
                            <div key={item._id} className="rounded-xl p-5 transition-all duration-200"
                                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}>

                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                                            style={{ background: 'var(--bg-hover)' }}>
                                            {item.companyName?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <button onClick={() => router.push(`/company/${item.company?.slug || item.companyName?.toLowerCase().replace(/\s+/g, '-')}`)}
                                                className="font-semibold text-white text-sm hover:underline">
                                                {item.companyName}
                                            </button>
                                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-xs px-2 py-0.5 rounded-md font-medium"
                                            style={{
                                                background: `${STAGE_COLORS[item.stage]}20`,
                                                color: STAGE_COLORS[item.stage] || 'var(--text-secondary)'
                                            }}>
                                            {STAGE_LABELS[item.stage] || item.stage}
                                        </span>
                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                            {timeAgo(item.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                {item.suspectedReason && (
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                        {item.suspectedReason}
                                    </p>
                                )}

                                {item.skills?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                        {item.skills.map((skill: string, i: number) => (
                                            <span key={i} className="text-xs px-2 py-0.5 rounded"
                                                style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}