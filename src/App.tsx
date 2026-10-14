import { useEffect, useState } from 'react'
import { AlertTriangle, Bell, Camera, Home, MessageCircle, PlusSquare, Shield, Send } from 'lucide-react'

type Lang = 'en' | 'te' | 'hi'

const T = {
  en: {
    appTitle: 'GroundTruth',
    tagline: 'Community Hazard Reporting & Clear Warnings',
    warningTitle: 'Official Weather Warning (IMD)',
    warningSummary: 'Orange Alert: Heavy to very heavy rainfall expected. Localized waterlogging in low-lying roads.',
    warningAction: 'Precaution: Avoid underpasses, stay away from electric poles, report blocked drains.',
    reportBtn: 'Report an Issue',
    myReports: 'My Reports',
    assistant: 'Assistant',
    home: 'Home',
    moderator: 'Moderator View',
    statusSubmitted: 'Submitted',
    statusAcknowledged: 'Acknowledged by Dept',
    statusInProgress: 'In Progress',
    statusResolutionReported: 'Fix Reported',
    statusAwaitingVerify: 'Awaiting Verification',
    statusResolved: 'Verified Resolved',
  },
  te: {
    appTitle: 'గ్రౌండ్‌ట్రూత్',
    tagline: 'సమాజ సమస్యల నివేదిక & హెచ్చరికలు',
    warningTitle: 'అధికారిక వాతావరణ హెచ్చరిక (IMD)',
    warningSummary: 'ఆరెంజ్ అలర్ట్: భారీ వర్షపాతం అవకాశం. రహదారులపై నీరు నిలిచే ప్రమాదం.',
    warningAction: 'జాగ్రత్తలు: అండర్‌పాస్‌లను నివారించండి, విద్యుత్ స్తంభాలకు దూరంగా ఉండండి.',
    reportBtn: 'సమస్యను నివేదించండి',
    myReports: 'నా నివేదికలు',
    assistant: 'సహాయకుడు',
    home: 'హోమ్',
    moderator: 'మోడరేటర్ వ్యూ',
    statusSubmitted: 'సమర్పించబడింది',
    statusAcknowledged: 'శాఖ ఆమోదించింది',
    statusInProgress: 'పురోగతిలో ఉంది',
    statusResolutionReported: 'పరిష్కారం నమోదు',
    statusAwaitingVerify: 'ధృవీకరణ వేచి ఉంది',
    statusResolved: 'పరిష్కరించబడింది',
  },
  hi: {
    appTitle: 'ग्राउंडट्रुथ',
    tagline: 'सामुदायिक आपदा रिपोर्टिंग और स्पष्ट चेतावनियाँ',
    warningTitle: 'आधिकारिक मौसम चेतावनी (IMD)',
    warningSummary: 'ऑरेंज अलर्ट: भारी से बहुत भारी बारिश की संभावना। सड़कों पर जलभराव का खतरा।',
    warningAction: 'सावधानी: जलभराव वाले रास्तों से बचें, बिजली के खंभों से दूर रहें।',
    reportBtn: 'समस्या दर्ज करें',
    myReports: 'मेरी रिपोर्ट',
    assistant: 'सहायक',
    home: 'होम',
    moderator: 'मॉडरेटर मोड',
    statusSubmitted: 'दर्ज की गई',
    statusAcknowledged: 'विभाग द्वारा स्वीकृत',
    statusInProgress: 'प्रगति पर है',
    statusResolutionReported: 'समाधान की सूचना',
    statusAwaitingVerify: 'सत्यापन बाकी है',
    statusResolved: 'सत्यापित एवं हल',
  },
} as const

type Status = 'submitted' | 'acknowledged' | 'in_progress' | 'resolution_reported' | 'awaiting_verification' | 'resolved'

interface Incident {
  id: string
  title: string
  category: string
  severity: string
  status: Status
  recipient: string
  timestamp: string
  landmark: string
  photo?: string
}

const seed: Incident[] = [
  { id: 'GT-8491', title: 'Severe Pothole on Banjara Hills Rd 12', category: 'Road Damage / Pothole', severity: 'Medium', status: 'in_progress', recipient: 'Municipal Road Maintenance Dept (GHMC)', timestamp: '2 hours ago', landmark: 'Banjara Hills Rd 12' },
  { id: 'GT-8492', title: 'Drinking water pipeline rupture near Metro Pillar 42', category: 'Pipeline Leak', severity: 'High', status: 'awaiting_verification', recipient: 'Water Supply & Sewerage Board', timestamp: '5 hours ago', landmark: 'Metro Pillar 42', photo: 'https://placehold.co/300x200?text=Fix+Photo' },
  { id: 'GT-8493', title: 'Fallen Banyan branch blocking two-wheeler lane', category: 'Fallen Tree', severity: 'Medium', status: 'resolved', recipient: 'Urban Biodiversity & Public Works', timestamp: '1 day ago', landmark: 'Jubilee Hills Checkpost' },
]

const routingMap: Record<string, string> = {
  'Road Damage / Pothole': 'Municipal Road Maintenance Dept (GHMC)',
  'Pipeline Leak': 'Water Supply & Sewerage Board',
  'Fallen Tree': 'Urban Biodiversity & Public Works',
  'Blocked Drain': 'Storm Water Drainage Dept',
}

export default function App() {
  const [lang, setLang] = useState<Lang>('en')
  const t = T[lang]
  const [view, setView] = useState<'home' | 'report' | 'reports' | 'mod' | 'assistant'>('home')
  const [incidents, setIncidents] = useState<Incident[]>(() => {
    const raw = localStorage.getItem('gt_incidents')
    return raw ? JSON.parse(raw) : seed
  })
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<string[]>(() => {
    const raw = localStorage.getItem('gt_notifs')
    return raw ? JSON.parse(raw) : ['GT-8492 acknowledged by Water Board']
  })
  const [reportForm, setReportForm] = useState({ photo: '', category: 'Road Damage / Pothole', severity: 'Medium', landmark: '', aiConfidence: 0.87 })
  const [modalOpen, setModalOpen] = useState(false)
  const [modalId, setModalId] = useState<string | null>(null)
  const [chat, setChat] = useState<{ from: 'user' | 'bot'; text: string }[]>([
    { from: 'bot', text: 'Hello! Ask me about report status or safety.' },
  ])
  const [chatInput, setChatInput] = useState('')

  useEffect(() => { localStorage.setItem('gt_incidents', JSON.stringify(incidents)) }, [incidents])
  useEffect(() => { localStorage.setItem('gt_notifs', JSON.stringify(notifications)) }, [notifications])

  const statusLabel = (s: Status) => {
    switch (s) {
      case 'submitted': return t.statusSubmitted
      case 'acknowledged': return t.statusAcknowledged
      case 'in_progress': return t.statusInProgress
      case 'resolution_reported': return t.statusResolutionReported
      case 'awaiting_verification': return t.statusAwaitingVerify
      case 'resolved': return t.statusResolved
    }
  }

  const submitReport = () => {
    const id = 'GT-' + Math.floor(1000 + Math.random() * 9000)
    const inc: Incident = {
      id,
      title: `${reportForm.category} at ${reportForm.landmark || 'Unknown'}`,
      category: reportForm.category,
      severity: reportForm.severity,
      status: 'submitted',
      recipient: routingMap[reportForm.category] || 'Municipal Coordination Office',
      timestamp: 'just now',
      landmark: reportForm.landmark,
      photo: reportForm.photo || undefined,
    }
    setIncidents([inc, ...incidents])
    setNotifications([`Report ${id} submitted`, ...notifications])
    setView('reports')
  }

  const advance = (id: string) => {
    const order: Status[] = ['submitted', 'acknowledged', 'in_progress', 'resolution_reported', 'awaiting_verification', 'resolved']
    setIncidents(prev => prev.map(i => {
      if (i.id !== id) return i
      const idx = order.indexOf(i.status)
      const next = order[Math.min(idx + 1, order.length - 1)]
      setNotifications(n => [`Report ${id} ${next}`, ...n])
      return { ...i, status: next }
    }))
  }

  const sendChat = (q: string) => {
    const userMsg = { from: 'user' as const, text: q }
    let botText = 'I can help with report status and safety tips.'
    if (q.toLowerCase().includes('status')) {
      botText = `You have ${incidents.length} reports. Latest: ${incidents[0]?.id} is ${statusLabel(incidents[0]?.status)}.`
    } else if (q.toLowerCase().includes('warning')) {
      botText = t.warningSummary + ' ' + t.warningAction
    } else if (q.toLowerCase().includes('tree')) {
      botText = 'Use Report tab, select Fallen Tree, add landmark and photo, submit.'
    }
    setChat(c => [...c, userMsg, { from: 'bot', text: botText }])
    setChatInput('')
  }

  const chips = ['Status of my report?', 'Explain current warning', 'How do I report a fallen tree?', 'Telugu translation']

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl border-x border-slate-200 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">G</div>
            <div>
              <div className="font-semibold text-slate-900 leading-tight">{t.appTitle}</div>
              <div className="text-[11px] text-slate-500">{t.tagline}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={lang} onChange={e => setLang(e.target.value as Lang)} className="text-sm border border-slate-200 rounded-full px-2 py-1">
              <option value="en">EN</option>
              <option value="te">తె</option>
              <option value="hi">हि</option>
            </select>
            <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-full hover:bg-slate-100">
              <Bell size={20} />
              {notifications.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{notifications.length}</span>}
            </button>
          </div>
        </header>

        {notifOpen && (
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 space-y-1">
            {notifications.map((n, i) => <div key={i} className="text-xs text-slate-700">• {n}</div>)}
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {view === 'home' && (
            <>
              <div className="rounded-2xl bg-orange-50 border border-orange-200 p-4">
                <div className="flex items-center gap-2 text-orange-700 font-semibold"><AlertTriangle size={18} /> {t.warningTitle}</div>
                <div className="text-sm text-orange-900 mt-1">{t.warningSummary}</div>
                <div className="text-xs text-orange-800 mt-2">{t.warningAction}</div>
              </div>
              <button onClick={() => setView('report')} className="w-full py-3 rounded-xl bg-indigo-600 text-white font-medium flex items-center justify-center gap-2">
                <PlusSquare size={18} /> {t.reportBtn}
              </button>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Total</div>
                  <div className="text-2xl font-bold">{incidents.length}</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Resolved</div>
                  <div className="text-2xl font-bold">{incidents.filter(i => i.status === 'resolved').length}</div>
                </div>
              </div>
              <div className="space-y-2">
                {incidents.slice(0, 3).map(i => (
                  <div key={i.id} className="rounded-xl border border-slate-200 p-3 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium">{i.title}</div>
                      <div className="text-xs text-slate-500">{i.id} • {i.timestamp}</div>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-slate-100">{statusLabel(i.status)}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {view === 'report' && (
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium">Photo</span>
                <input type="file" accept="image/*" onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) setReportForm(r => ({ ...r, photo: URL.createObjectURL(f) }))
                }} className="mt-1 w-full text-sm" />
                {reportForm.photo && <img src={reportForm.photo} className="mt-2 rounded-xl max-h-40" />}
              </label>
              <div>
                <div className="text-sm font-medium mb-1">AI Suggested Category</div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs">AI: {reportForm.category} • {(reportForm.aiConfidence * 100).toFixed(0)}%</span>
                </div>
                <select value={reportForm.category} onChange={e => setReportForm(r => ({ ...r, category: e.target.value }))} className="mt-2 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  {Object.keys(routingMap).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <label className="block">
                <span className="text-sm font-medium">Severity</span>
                <select value={reportForm.severity} onChange={e => setReportForm(r => ({ ...r, severity: e.target.value }))} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Landmark / Location</span>
                <input value={reportForm.landmark} onChange={e => setReportForm(r => ({ ...r, landmark: e.target.value }))} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="e.g., Metro Pillar 42" />
              </label>
              <p className="text-xs text-slate-500">Severity is an estimate — pending review.</p>
              <button onClick={submitReport} className="w-full py-3 rounded-xl bg-indigo-600 text-white font-medium flex items-center justify-center gap-2">
                <Send size={18} /> Submit Report
              </button>
              <div className="text-xs text-slate-500">Routing to: {routingMap[reportForm.category] || 'Municipal Coordination Office'} (Simulated Demo Destination)</div>
            </div>
          )}

          {view === 'reports' && (
            <div className="space-y-3">
              {incidents.map(i => (
                <div key={i.id} className="rounded-xl border border-slate-200 p-3 space-y-2">
                  <div className="flex justify-between">
                    <div>
                      <div className="text-sm font-medium">{i.title}</div>
                      <div className="text-xs text-slate-500">{i.id} • {i.recipient}</div>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-slate-100">{statusLabel(i.status)}</span>
                  </div>
                  {/* progress tracker */}
                  <div className="flex gap-1">
                    {['submitted', 'acknowledged', 'in_progress', 'resolution_reported', 'awaiting_verification', 'resolved'].map(s => (
                      <div key={s} className={`h-1.5 flex-1 rounded ${['submitted','acknowledged','in_progress','resolution_reported','awaiting_verification','resolved'].indexOf(s) <= ['submitted','acknowledged','in_progress','resolution_reported','awaiting_verification','resolved'].indexOf(i.status) ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  {i.photo && <img src={i.photo} className="rounded-lg max-h-24" />}
                  <button onClick={() => { setModalId(i.id); setModalOpen(true) }} className="text-xs text-indigo-600">Feedback</button>
                </div>
              ))}
            </div>
          )}

          {view === 'mod' && (
            <div className="space-y-3">
              <div className="text-sm font-medium flex items-center gap-2"><Shield size={16} /> {t.moderator}</div>
              {incidents.map(i => (
                <div key={i.id} className="rounded-xl border border-slate-200 p-3 flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium">{i.id}</div>
                    <div className="text-xs text-slate-500">{statusLabel(i.status)}</div>
                  </div>
                  <button onClick={() => advance(i.id)} className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs">Advance 1 step</button>
                </div>
              ))}
            </div>
          )}

          {view === 'assistant' && (
            <div className="flex flex-col h-[60vh]">
              <div className="flex-1 overflow-y-auto space-y-2">
                {chat.map((m, i) => (
                  <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-3 py-2 rounded-2xl max-w-[80%] text-sm ${m.from === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-900'}`}>{m.text}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap mt-2">
                {chips.map(c => <button key={c} onClick={() => sendChat(c)} className="text-xs px-2 py-1 rounded-full bg-slate-100">{c}</button>)}
              </div>
              <div className="flex gap-2 mt-2">
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Ask..." />
                <button onClick={() => chatInput && sendChat(chatInput)} className="px-3 rounded-lg bg-indigo-600 text-white text-sm">Send</button>
              </div>
            </div>
          )}
        </main>

        {/* Bottom Nav */}
        <nav className="border-t border-slate-200 bg-white px-2 py-2 flex justify-around">
          {[
            { id: 'home', label: t.home, icon: Home },
            { id: 'report', label: t.reportBtn, icon: PlusSquare },
            { id: 'reports', label: t.myReports, icon: Camera },
            { id: 'mod', label: t.moderator, icon: Shield },
            { id: 'assistant', label: t.assistant, icon: MessageCircle },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setView(id as any)} className={`flex flex-col items-center gap-0.5 text-[10px] ${view === id ? 'text-indigo-600' : 'text-slate-500'}`}>
              <Icon size={20} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-5 w-80 space-y-3">
            <div className="font-semibold">Feedback for {modalId}</div>
            <div className="flex gap-2">
              <button onClick={() => { setModalOpen(false) }} className="flex-1 py-2 rounded-lg bg-emerald-100 text-emerald-700 text-sm">Looks resolved</button>
              <button onClick={() => { setModalOpen(false) }} className="flex-1 py-2 rounded-lg bg-red-100 text-red-700 text-sm">Still happening</button>
            </div>
            <button onClick={() => setModalOpen(false)} className="w-full py-2 rounded-lg border text-sm">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}