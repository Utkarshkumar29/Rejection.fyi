'use client'

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

const LandingPage = () => {
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const [activeFeature, setActiveFeature] = useState(0)

    useEffect(() => {
        setMounted(true)
        const interval = setInterval(() => {
            setActiveFeature(prev => (prev + 1) % 4)
        }, 3500)
        return () => clearInterval(interval)
    }, [])

    const features = [
        {
            icon: "🔒",
            title: "Fully anonymous",
            desc: "Submit without creating an account. No names, no emails, no tracking. Your story stays yours."
        },
        {
            icon: "📡",
            title: "Live rejection feed",
            desc: "New submissions appear in real-time via SSE. See what's happening across the industry as it happens."
        },
        {
            icon: "🤖",
            title: "AI trend analysis",
            desc: "Gemini-powered pattern recognition identifies what companies are really rejecting candidates for."
        },
        {
            icon: "📊",
            title: "Company insights",
            desc: "See average YOE rejected, most common stages, and skill gaps across hundreds of companies."
        }
    ]

    const steps = [
        {
            number: "01",
            title: "Get the rejection email",
            desc: "You know the one. \"We've decided to move forward with other candidates.\" Copy it."
        },
        {
            number: "02",
            title: "Submit what you know",
            desc: "Add the company, role, stage, your YOE, and what you think the real reason was."
        },
        {
            number: "03",
            title: "Patterns emerge",
            desc: "Your data joins thousands of others. AI surfaces what companies won't tell you directly."
        }
    ]

    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>

            {/* Navbar */}
            <nav className="sticky top-0 z-20 backdrop-blur-md"
                style={{ background: 'rgba(15, 17, 23, 0.9)', borderBottom: '1px solid var(--border)' }}>
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 cursor-pointer">
                        <div className="w-7 h-7 rounded flex items-center justify-center"
                            style={{ background: 'var(--accent-red)' }}>
                            <span className="text-white text-xs font-bold">R</span>
                        </div>
                        <span className="font-semibold text-white tracking-tight">rejected.fyi</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <a href="/login" className="text-sm transition-colors px-3 py-2 rounded-lg"
                            style={{ color: 'var(--text-secondary)' }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                            Sign in
                        </a>
                        <a href="/register"
                            className="text-sm px-4 py-2 rounded-lg font-medium text-white transition-all"
                            style={{ background: 'var(--accent-red)' }}
                            onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
                            onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}>
                            Get started
                        </a>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className={`max-w-6xl mx-auto px-6 pt-24 pb-20 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <div className="max-w-3xl">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
                        style={{ background: 'rgba(229, 62, 62, 0.1)', border: '1px solid rgba(229, 62, 62, 0.2)', color: '#fc8181' }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                        Live rejection data · Updated in real-time
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
                        The transparency layer<br />
                        <span style={{ color: 'var(--accent-red)' }}>hiring never wanted.</span>
                    </h1>

                    <p className="text-lg leading-relaxed mb-4 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
                        Professionals anonymously share real rejection data — the actual emails, the suspected reasons, the stage they got cut at — so others can make informed decisions.
                    </p>

                    <p className="text-sm leading-relaxed mb-10 max-w-xl" style={{ color: 'var(--text-muted)' }}>
                        No more guessing why you didn't get a callback. See patterns across thousands of real rejections, filtered by company, role, and experience level.
                    </p>

                    <div className="flex flex-wrap items-center gap-4">
                        <button onClick={() => router.push("/rejections")}
                            className="px-6 py-3.5 rounded-lg text-sm font-semibold text-white transition-all"
                            style={{ background: 'var(--accent-red)' }}
                            onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
                            onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}>
                            Browse the feed
                        </button>
                        <button onClick={() => router.push("/rejections")}
                            className="px-6 py-3.5 rounded-lg text-sm font-semibold transition-all"
                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-light)'
                                e.currentTarget.style.color = 'var(--text-primary)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border)'
                                e.currentTarget.style.color = 'var(--text-secondary)'
                            }}>
                            Share your story
                        </button>
                    </div>
                </div>
            </section>

            {/* Stats row */}
            <section className={`max-w-6xl mx-auto px-6 pb-20 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { value: "100%", label: "Anonymous", desc: "No identity stored" },
                        { value: "Live", label: "Real-time feed", desc: "SSE powered" },
                        { value: "AI", label: "Trend analysis", desc: "Gemini powered" },
                        { value: "Free", label: "No paywalls", desc: "Always open" },
                    ].map((stat, i) => (
                        <div key={i} className="rounded-xl p-5 text-center transition-all duration-200"
                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-light)')}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}>
                            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                            <div className="text-sm font-medium mb-0.5" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className={`max-w-6xl mx-auto px-6 pb-24 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <div className="mb-10">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--accent-red)' }}>
                        What you get
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">
                        Built for professionals who deserve answers
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* Feature list */}
                    <div className="md:col-span-5 space-y-2">
                        {features.map((f, idx) => (
                            <button key={idx} onClick={() => setActiveFeature(idx)}
                                className="w-full text-left p-4 rounded-xl transition-all duration-200"
                                style={{
                                    background: activeFeature === idx ? 'var(--bg-hover)' : 'var(--bg-card)',
                                    border: `1px solid ${activeFeature === idx ? 'var(--border-light)' : 'var(--border)'}`,
                                }}>
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{f.icon}</span>
                                    <span className="text-sm font-semibold"
                                        style={{ color: activeFeature === idx ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                        {f.title}
                                    </span>
                                </div>
                                {activeFeature === idx && (
                                    <div className="mt-2.5 ml-9">
                                        <div className="w-full h-0.5 rounded-full" style={{ background: 'var(--accent-red)', opacity: 0.5 }} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Feature detail */}
                    <div className="md:col-span-7 rounded-xl p-8 flex flex-col justify-center min-h-[240px]"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <div className="text-4xl mb-5">{features[activeFeature].icon}</div>
                        <h3 className="text-xl font-bold text-white mb-3">{features[activeFeature].title}</h3>
                        <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {features[activeFeature].desc}
                        </p>
                        <div className="mt-6 pt-5 flex items-center justify-between text-xs"
                            style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                            <span>Feature {activeFeature + 1} of {features.length}</span>
                            <div className="flex gap-1.5">
                                {features.map((_, i) => (
                                    <button key={i} onClick={() => setActiveFeature(i)}
                                        className="w-1.5 h-1.5 rounded-full transition-all"
                                        style={{ background: i === activeFeature ? 'var(--accent-red)' : 'var(--border)' }} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className={`max-w-6xl mx-auto px-6 pb-24 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <div className="mb-10">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--accent-red)' }}>
                        How it works
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">
                        Three steps to real answers
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {steps.map((step, i) => (
                        <div key={i} className="rounded-xl p-6 relative overflow-hidden transition-all duration-200"
                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-light)')}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}>

                            {/* Step number watermark */}
                            <div className="absolute top-4 right-4 text-5xl font-bold select-none pointer-events-none"
                                style={{ color: 'rgba(255,255,255,0.03)' }}>
                                {step.number}
                            </div>

                            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-4 text-sm font-bold"
                                style={{ background: 'rgba(229, 62, 62, 0.1)', color: 'var(--accent-red)', border: '1px solid rgba(229, 62, 62, 0.2)' }}>
                                {step.number}
                            </div>

                            <h4 className="font-semibold text-white mb-2">{step.title}</h4>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                {step.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Sample rejection card */}
            <section className={`max-w-6xl mx-auto px-6 pb-24 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <div className="mb-10">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--accent-red)' }}>
                        Real examples
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">
                        What the data looks like
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        {
                            company: "Tredence Inc.", role: "Full Stack Engineer", stage: "Technical Interview",
                            stageColor: 'rgba(66, 153, 225, 0.12)', stageText: '#63b3ed',
                            yoe: 1.5, location: "Bangalore",
                            message: "Thank you for your interest in the Full Stack Engineer position. Unfortunately, we will not be moving forward with your application at this time.",
                            reason: "I think they wanted someone with more system design experience. The screening was just basic coding but I wasn't asked about architecture at all.",
                            skills: ["React", "Node.js", "MongoDB"]
                        },
                        {
                            company: "Bombay Design Centre", role: "Frontend Developer", stage: "Resume Screen",
                            stageColor: 'rgba(229, 62, 62, 0.12)', stageText: '#fc8181',
                            yoe: 0.8, location: "Mumbai",
                            message: "Unfortunately, Bombay Design Centre did not select your application to move forward in the hiring process.",
                            reason: "Probably not enough years of experience. The JD said 2+ years but I only have under 1 year. Should have been clearer in the JD.",
                            skills: ["React", "TypeScript", "Figma"]
                        }
                    ].map((item, i) => (
                        <div key={i} className="rounded-xl p-5 transition-all duration-200"
                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shrink-0"
                                    style={{ background: 'var(--bg-hover)' }}>
                                    {item.company.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-semibold text-white text-sm">{item.company}</div>
                                    <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                                        <span>{item.role}</span>
                                        <span>·</span>
                                        <span>{item.yoe} YOE</span>
                                        <span>·</span>
                                        <span>{item.location}</span>
                                    </div>
                                </div>
                                <span className="ml-auto text-xs px-2 py-0.5 rounded-md font-medium"
                                    style={{ background: item.stageColor, color: item.stageText }}>
                                    {item.stage}
                                </span>
                            </div>

                            <div className="px-4 py-3 rounded-lg text-sm italic mb-3"
                                style={{ background: 'rgba(255,255,255,0.03)', borderLeft: '3px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                                "{item.message}"
                            </div>

                            <div className="mb-3">
                                <span className="text-xs px-2 py-0.5 rounded font-medium"
                                    style={{ background: 'rgba(229, 62, 62, 0.08)', color: '#fc8181' }}>
                                    Suspected reason
                                </span>
                                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                    {item.reason}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                {item.skills.map((skill, j) => (
                                    <span key={j} className="text-xs px-2 py-0.5 rounded"
                                        style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA section */}
            <section className={`max-w-6xl mx-auto px-6 pb-28 transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <div className="rounded-2xl p-10 sm:p-14 text-center relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-card) 100%)',
                        border: '1px solid var(--border)'
                    }}>

                    {/* Subtle red glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(229,62,62,0.4), transparent)' }} />

                    <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                        Every rejection is data.<br />
                        <span style={{ color: 'var(--text-secondary)' }}>Start using it.</span>
                    </h2>
                    <p className="text-base mb-8 max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        Join professionals who are tired of corporate non-answers and are building the transparency layer hiring never wanted to exist.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <button onClick={() => router.push("/register")}
                            className="px-8 py-3.5 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer"
                            style={{ background: 'var(--accent-red)' }}
                            onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
                            onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}>
                            Create free account
                        </button>
                        <button onClick={() => router.push("/rejections")}
                            className="px-8 py-3.5 rounded-lg text-sm font-semibold transition-all cursor-pointer"
                            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-light)'
                                e.currentTarget.style.color = 'var(--text-primary)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border)'
                                e.currentTarget.style.color = 'var(--text-secondary)'
                            }}>
                            Browse anonymously
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: 'var(--accent-red)' }}>
                            <span className="text-white text-xs font-bold">R</span>
                        </div>
                        <span className="text-sm font-semibold text-white">rejected.fyi</span>
                        <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                            Built for professionals
                        </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--text-muted)' }}>
                        <a href="/rejections" className="transition-colors hover:text-white">Feed</a>
                        <a href="/login" className="transition-colors hover:text-white">Sign in</a>
                        <a href="/register" className="transition-colors hover:text-white">Register</a>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto px-6 pb-6">
                    <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                        © 2025 rejected.fyi · Anonymous by design · No data sold, ever.
                    </p>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage