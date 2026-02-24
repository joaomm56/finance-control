import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, Legend
} from 'recharts'
import { listAccounts, createAccount, deleteAccount } from '../api/accounts'
import { listTransactions, createTransaction, deleteTransaction } from '../api/transactions'
import { listBudgets, createBudget, deleteBudget } from '../api/budgets'

// ── useIsMobile hook ──────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)
const IconHome     = () => <Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" />
const IconWallet   = () => <Icon d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5m-10 0h10M16 12a1 1 0 100-2 1 1 0 000 2z" />
const IconTx       = () => <Icon d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
const IconPlus     = () => <Icon d="M12 5v14M5 12h14" />
const IconLogout   = () => <Icon d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
const IconTrash    = () => <Icon d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" size={16} />
const IconClose    = () => <Icon d="M18 6L6 18M6 6l12 12" size={18} />
const IconTrend    = () => <Icon d="M22 12h-4l-3 9L9 3l-3 9H2" />
const IconChevL    = () => <Icon d="M15 18l-6-6 6-6" size={16} />
const IconChevR    = () => <Icon d="M9 18l6-6-6-6" size={16} />
const IconTarget   = () => <Icon d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-6a4 4 0 100-8 4 4 0 000 8zm0-2a2 2 0 110-4 2 2 0 010 4z" />
const IconReport   = () => <Icon d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6M16 13H8M16 17H8M10 9H8" />
const IconChart    = () => <Icon d="M18 20V10M12 20V4M6 20v-6" />
const IconTag      = () => <Icon d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" />
const IconTool     = () => <Icon d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
const IconSettings = () => <Icon d="M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
const IconDownload = () => <Icon d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
const IconEdit     = () => <Icon d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" size={16} />

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const PIE_COLORS = ['#C9F04D','#4D9FF0','#F04DA0','#F0A04D','#A04DF0','#4DF0C9','#F04D4D','#4DF04D']

function fmtEur(val) {
  return `€${Number(val || 0).toLocaleString('pt-PT', { minimumFractionDigits: 2 })}`
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 14px' }}>
        <p style={{ color: '#888', fontSize: 11, margin: '0 0 4px' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontSize: 13, fontWeight: 700, margin: 0 }}>{fmtEur(p.value)}</p>
        ))}
      </div>
    )
  }
  return null
}

// ── Modals ────────────────────────────────────────────────────────────────────
function CreateAccountModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', type: 'current', balance: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try { await createAccount(form.name, form.type, parseFloat(form.balance) || 0); onCreated(); onClose() }
    catch (err) { setError(err.response?.data?.detail || 'Failed to create account.') }
    finally { setLoading(false) }
  }
  return (
    <div style={cs.overlay} onClick={onClose}>
      <div style={cs.modal} onClick={e => e.stopPropagation()}>
        <div style={cs.modalHeader}><h2 style={cs.modalTitle}>New Account</h2><button onClick={onClose} style={cs.iconBtn}><IconClose /></button></div>
        <form onSubmit={handleSubmit} style={cs.form}>
          <div style={cs.field}><label style={cs.label}>Account Name</label><input style={cs.input} placeholder="e.g. Main Account" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
          <div style={cs.field}><label style={cs.label}>Type</label>
            <select style={cs.input} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="current">Current</option><option value="saving">Saving</option><option value="investment">Investment</option>
            </select></div>
          <div style={cs.field}><label style={cs.label}>Initial Balance (€)</label><input style={cs.input} type="number" step="0.01" placeholder="0.00" value={form.balance} onChange={e => setForm({ ...form, balance: e.target.value })} /></div>
          {error && <p style={cs.error}>{error}</p>}
          <button type="submit" disabled={loading} style={{ ...cs.submitBtn, opacity: loading ? 0.7 : 1 }}>{loading ? 'Creating...' : 'Create Account'}</button>
        </form>
      </div>
    </div>
  )
}

function CreateBudgetModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ category: '', limit_amount: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try { await createBudget(form.category, parseFloat(form.limit_amount)); await onCreated(); onClose() }
    catch (err) { setError(err.response?.data?.detail || 'Failed to create budget.') }
    finally { setLoading(false) }
  }
  return (
    <div style={cs.overlay} onClick={onClose}>
      <div style={cs.modal} onClick={e => e.stopPropagation()}>
        <div style={cs.modalHeader}><h2 style={cs.modalTitle}>New Budget</h2><button onClick={onClose} style={cs.iconBtn}><IconClose /></button></div>
        <form onSubmit={handleSubmit} style={cs.form}>
          <div style={cs.field}><label style={cs.label}>Category</label><input style={cs.input} placeholder="e.g. Food, Transport..." value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required /></div>
          <div style={cs.field}><label style={cs.label}>Monthly Limit (€)</label><input style={cs.input} type="number" step="0.01" placeholder="0.00" value={form.limit_amount} onChange={e => setForm({ ...form, limit_amount: e.target.value })} required /></div>
          {error && <p style={cs.error}>{error}</p>}
          <button type="submit" disabled={loading} style={{ ...cs.submitBtn, opacity: loading ? 0.7 : 1 }}>{loading ? 'Creating...' : 'Create Budget'}</button>
        </form>
      </div>
    </div>
  )
}

function CreateTransactionModal({ accounts, onClose, onCreated }) {
  const [form, setForm] = useState({ account_id: accounts[0]?.id || '', type: 'expense', category: '', amount: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      await createTransaction({ account_id: parseInt(form.account_id), type: form.type, category: form.category, amount: parseFloat(form.amount), description: form.description || null })
      onCreated(); onClose()
    } catch (err) { setError(err.response?.data?.detail || 'Failed to create transaction.') }
    finally { setLoading(false) }
  }
  return (
    <div style={cs.overlay} onClick={onClose}>
      <div style={cs.modal} onClick={e => e.stopPropagation()}>
        <div style={cs.modalHeader}><h2 style={cs.modalTitle}>New Transaction</h2><button onClick={onClose} style={cs.iconBtn}><IconClose /></button></div>
        <form onSubmit={handleSubmit} style={cs.form}>
          <div style={cs.field}><label style={cs.label}>Account</label>
            <select style={cs.input} value={form.account_id} onChange={e => setForm({ ...form, account_id: e.target.value })}>
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({fmtEur(acc.balance)})</option>)}
            </select></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={cs.field}><label style={cs.label}>Type</label>
              <select style={cs.input} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="expense">Expense</option><option value="income">Income</option>
              </select></div>
            <div style={cs.field}><label style={cs.label}>Amount (€)</label><input style={cs.input} type="number" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required /></div>
          </div>
          <div style={cs.field}><label style={cs.label}>Category</label><input style={cs.input} placeholder="e.g. Food, Salary..." value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required /></div>
          <div style={cs.field}><label style={cs.label}>Description <span style={{ color: '#444', fontSize: 11 }}>(optional)</span></label><input style={cs.input} placeholder="Add a note..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          {error && <p style={cs.error}>{error}</p>}
          <button type="submit" disabled={loading} style={{ ...cs.submitBtn, opacity: loading ? 0.7 : 1 }}>{loading ? 'Saving...' : 'Save Transaction'}</button>
        </form>
      </div>
    </div>
  )
}

function CreateGoalModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', target: '', saved: '', deadline: '' })
  const handleSubmit = (e) => {
    e.preventDefault()
    const goals = JSON.parse(localStorage.getItem('goals') || '[]')
    goals.push({ id: Date.now(), name: form.name, target: parseFloat(form.target), saved: parseFloat(form.saved) || 0, deadline: form.deadline })
    localStorage.setItem('goals', JSON.stringify(goals))
    onCreated(); onClose()
  }
  return (
    <div style={cs.overlay} onClick={onClose}>
      <div style={cs.modal} onClick={e => e.stopPropagation()}>
        <div style={cs.modalHeader}><h2 style={cs.modalTitle}>New Goal</h2><button onClick={onClose} style={cs.iconBtn}><IconClose /></button></div>
        <form onSubmit={handleSubmit} style={cs.form}>
          <div style={cs.field}><label style={cs.label}>Goal Name</label><input style={cs.input} placeholder="e.g. Emergency Fund, New Car..." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={cs.field}><label style={cs.label}>Target (€)</label><input style={cs.input} type="number" step="0.01" placeholder="5000.00" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} required /></div>
            <div style={cs.field}><label style={cs.label}>Already Saved (€)</label><input style={cs.input} type="number" step="0.01" placeholder="0.00" value={form.saved} onChange={e => setForm({ ...form, saved: e.target.value })} /></div>
          </div>
          <div style={cs.field}><label style={cs.label}>Deadline</label><input style={{ ...cs.input, colorScheme: 'dark' }} type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} /></div>
          <button type="submit" style={cs.submitBtn}>Create Goal</button>
        </form>
      </div>
    </div>
  )
}

function CreateCategoryModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', type: 'expense', color: '#C9F04D', icon: '🏷️' })
  const icons = ['🏠','🚗','🍕','☕','🏥','📚','✈️','💪','🎮','👔','💡','🛒','🎁','💰','📱','🎵']
  const handleSubmit = (e) => {
    e.preventDefault()
    const cats = JSON.parse(localStorage.getItem('categories') || '[]')
    cats.push({ id: Date.now(), ...form })
    localStorage.setItem('categories', JSON.stringify(cats))
    onCreated(); onClose()
  }
  return (
    <div style={cs.overlay} onClick={onClose}>
      <div style={cs.modal} onClick={e => e.stopPropagation()}>
        <div style={cs.modalHeader}><h2 style={cs.modalTitle}>New Category</h2><button onClick={onClose} style={cs.iconBtn}><IconClose /></button></div>
        <form onSubmit={handleSubmit} style={cs.form}>
          <div style={cs.field}><label style={cs.label}>Name</label><input style={cs.input} placeholder="e.g. Food, Transport..." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={cs.field}><label style={cs.label}>Type</label>
              <select style={cs.input} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="expense">Expense</option><option value="income">Income</option><option value="both">Both</option>
              </select></div>
            <div style={cs.field}><label style={cs.label}>Color</label><input style={{ ...cs.input, padding: 8, height: 44 }} type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} /></div>
          </div>
          <div style={cs.field}><label style={cs.label}>Icon</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {icons.map(ic => (
                <button key={ic} type="button" onClick={() => setForm({ ...form, icon: ic })}
                  style={{ width: 38, height: 38, borderRadius: 8, border: `2px solid ${form.icon === ic ? '#C9F04D' : '#2a2a2a'}`, background: '#1a1a1a', fontSize: 18, cursor: 'pointer' }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" style={cs.submitBtn}>Create Category</button>
        </form>
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const now = new Date()
  const [activeTab, setActiveTab] = useState('overview')
  const [currentMonth, setCurrentMonth] = useState(now.getMonth())
  const [currentYear, setCurrentYear] = useState(now.getFullYear())
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [goals, setGoals] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showTxModal, setShowTxModal] = useState(false)
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [reportPeriod, setReportPeriod] = useState('monthly')
  const [chartType, setChartType] = useState('line')
  const [chartPeriod, setChartPeriod] = useState('6months')
  const [settingsForm, setSettingsForm] = useState({ name: user.name || '', email: user.email || '', password: '', passwordConfirm: '' })
  const [settingsSaved, setSettingsSaved] = useState(false)

  const fetchAccounts     = async () => { try { setAccounts(await listAccounts()) } catch (e) { console.error(e) } finally { setLoading(false) } }
  const fetchTransactions = async () => { try { setTransactions(await listTransactions()) } catch (e) { console.error(e) } }
  const fetchBudgets      = async () => { try { setBudgets(await listBudgets()) } catch (e) { console.error(e) } }
  const fetchGoals        = () => setGoals(JSON.parse(localStorage.getItem('goals') || '[]'))
  const fetchCategories   = () => setCategories(JSON.parse(localStorage.getItem('categories') || '[]'))

  useEffect(() => {
    const load = async () => { await fetchAccounts(); await fetchTransactions(); await fetchBudgets() }
    load(); fetchGoals(); fetchCategories()
  }, [])

  const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) } else setCurrentMonth(m => m - 1) }
  const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) } else setCurrentMonth(m => m + 1) }

  const monthTxs      = useMemo(() => transactions.filter(tx => { const d = new Date(tx.date); return d.getMonth() === currentMonth && d.getFullYear() === currentYear }), [transactions, currentMonth, currentYear])
  const totalIncome   = useMemo(() => monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0), [monthTxs])
  const totalExpenses = useMemo(() => monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0), [monthTxs])
  const totalBalance  = useMemo(() => accounts.reduce((s, a) => s + Number(a.balance), 0), [accounts])

  const last7Days = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const label = `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}`
      const dayStr = d.toISOString().split('T')[0]
      days.push({ label, expenses: transactions.filter(t => t.type==='expense' && t.date?.startsWith(dayStr)).reduce((s,t)=>s+Number(t.amount),0), income: transactions.filter(t => t.type==='income' && t.date?.startsWith(dayStr)).reduce((s,t)=>s+Number(t.amount),0) })
    }
    return days
  }, [transactions])

  const expensesByCategory = useMemo(() => {
    const map = {}
    monthTxs.filter(t => t.type === 'expense').forEach(t => { map[t.category] = (map[t.category] || 0) + Number(t.amount) })
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 })).sort((a, b) => b.value - a.value)
  }, [monthTxs])

  const last6Months = useMemo(() => {
    const result = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1)
      const m = d.getMonth(); const y = d.getFullYear()
      const txs = transactions.filter(t => { const td = new Date(t.date); return td.getMonth() === m && td.getFullYear() === y })
      result.push({ label: MONTHS[m].slice(0,3), expenses: txs.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0), income: txs.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0) })
    }
    return result
  }, [transactions, currentMonth, currentYear])

  // ── Reports data ─────────────────────────────────────────────────────────
  const weeklyReport = useMemo(() => {
    const weeks = []
    for (let w = 3; w >= 0; w--) {
      const start = new Date(); start.setDate(start.getDate() - (w+1)*7)
      const end   = new Date(); end.setDate(end.getDate() - w*7)
      const txs   = transactions.filter(t => { const d = new Date(t.date); return d >= start && d < end })
      const label = `${start.getDate().toString().padStart(2,'0')}/${(start.getMonth()+1).toString().padStart(2,'0')}`
      weeks.push({
        label, period: `${start.toLocaleDateString('pt-PT')} – ${end.toLocaleDateString('pt-PT')}`,
        income:   txs.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0),
        expenses: txs.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0),
        txCount:  txs.length
      })
    }
    return weeks
  }, [transactions])

  const monthlyReport = useMemo(() => {
    const result = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const m = d.getMonth(); const y = d.getFullYear()
      const txs = transactions.filter(t => { const td = new Date(t.date); return td.getMonth() === m && td.getFullYear() === y })
      const income   = txs.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0)
      const expenses = txs.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0)
      result.push({ label: `${MONTHS[m].slice(0,3)} ${y}`, income, expenses, net: income - expenses, txCount: txs.length })
    }
    return result
  }, [transactions])

  const annualReport = useMemo(() => {
    const years = [...new Set(transactions.map(t => new Date(t.date).getFullYear()))].sort()
    if (years.length === 0) years.push(now.getFullYear())
    return years.map(y => {
      const txs = transactions.filter(t => new Date(t.date).getFullYear() === y)
      const income   = txs.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0)
      const expenses = txs.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0)
      return { label: String(y), income, expenses, net: income - expenses, txCount: txs.length }
    })
  }, [transactions])

  // ── Charts data ───────────────────────────────────────────────────────────
  const chartData = useMemo(() => {
    if (chartPeriod === '7days') return last7Days
    if (chartPeriod === '6months') return last6Months
    if (chartPeriod === '12months') {
      const result = []
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const m = d.getMonth(); const y = d.getFullYear()
        const txs = transactions.filter(t => { const td = new Date(t.date); return td.getMonth() === m && td.getFullYear() === y })
        result.push({ label: MONTHS[m].slice(0,3), expenses: txs.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0), income: txs.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0) })
      }
      return result
    }
    return last6Months
  }, [chartPeriod, last7Days, last6Months, transactions])

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleDelete       = async (id) => { if (!confirm('Delete this account?')) return; try { await deleteAccount(id); fetchAccounts() } catch { alert('Failed.') } }
  const handleDeleteTx     = async (id) => { if (!confirm('Delete?')) return; try { await deleteTransaction(id); fetchTransactions(); fetchAccounts() } catch { alert('Failed.') } }
  const handleDeleteBudget = async (id) => { if (!confirm('Delete?')) return; try { await deleteBudget(id); fetchBudgets() } catch { alert('Failed.') } }
  const handleDeleteGoal   = (id) => { if (!confirm('Delete goal?')) return; const updated = goals.filter(g => g.id !== id); localStorage.setItem('goals', JSON.stringify(updated)); setGoals(updated) }
  const handleDeleteCategory = (id) => { if (!confirm('Delete category?')) return; const updated = categories.filter(c => c.id !== id); localStorage.setItem('categories', JSON.stringify(updated)); setCategories(updated) }
  const handleLogout       = () => { localStorage.removeItem('access_token'); localStorage.removeItem('user'); navigate('/login') }

  const handleSaveSettings = (e) => {
    e.preventDefault()
    if (settingsForm.password && settingsForm.password !== settingsForm.passwordConfirm) { alert('Passwords do not match'); return }
    const updatedUser = { ...user, name: settingsForm.name, email: settingsForm.email }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 2500)
  }

  const exportCSV = () => {
    const headers = ['Date','Type','Category','Amount','Description','Account']
    const rows = transactions.map(tx => {
      const acc = accounts.find(a => a.id === tx.account_id)
      return [tx.date, tx.type, tx.category, tx.amount, tx.description || '', acc?.name || '']
    })
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const exportJSON = () => {
    const data = { accounts, transactions, budgets, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url; a.download = 'fincontrol-backup.json'; a.click()
    URL.revokeObjectURL(url)
  }

  const navItems = [
    { id: 'overview',     label: 'Overview',     icon: <IconHome /> },
    { id: 'accounts',     label: 'Accounts',     icon: <IconWallet /> },
    { id: 'transactions', label: 'Transactions', icon: <IconTx /> },
    { id: 'budgets',      label: 'Budgets',      icon: <IconTrend /> },
    { id: 'goals',        label: 'Goals',        icon: <IconTarget /> },
    { id: 'reports',      label: 'Reports',      icon: <IconReport /> },
    { id: 'charts',       label: 'Charts',       icon: <IconChart /> },
    { id: 'categories',   label: 'Categories',   icon: <IconTag /> },
    { id: 'tools',        label: 'Tools',        icon: <IconTool /> },
    { id: 'settings',     label: 'Settings',     icon: <IconSettings /> },
  ]

  const mobileNavItems = [
    { id: 'overview',     label: 'Overview',  icon: <IconHome /> },
    { id: 'transactions', label: 'Txns',      icon: <IconTx /> },
    { id: 'budgets',      label: 'Budgets',   icon: <IconTrend /> },
    { id: 'goals',        label: 'Goals',     icon: <IconTarget /> },
    { id: 'reports',      label: 'Reports',   icon: <IconReport /> },
  ]

  const accentColor = (type) => ({ current: '#C9F04D', saving: '#4D9FF0', investment: '#F0A04D' }[type] || '#C9F04D')
  const gridCols    = isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)'
  const contentPad  = isMobile ? '16px' : '28px 40px'

  const reportRows = reportPeriod === 'weekly' ? weeklyReport : reportPeriod === 'monthly' ? monthlyReport : annualReport

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: '#f0f0f0', fontFamily: "'DM Sans', sans-serif", flexDirection: isMobile ? 'column' : 'row' }}>

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside style={cs.sidebar}>
          <div style={cs.sidebarTop}>
            <div style={cs.logo}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#C9F04D" /><path d="M8 20L14 12L19 17L24 10" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="24" cy="10" r="2" fill="#0a0a0a" /></svg>
              <span style={cs.logoText}>FinControl</span>
            </div>
            {/* Group nav items */}
            <nav style={cs.nav}>
              <p style={cs.navGroup}>MAIN</p>
              {navItems.slice(0,4).map(item => (
                <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ ...cs.navItem, ...(activeTab === item.id ? cs.navItemActive : {}) }}>
                  <span style={{ color: activeTab === item.id ? '#C9F04D' : '#555' }}>{item.icon}</span>{item.label}
                </button>
              ))}
              <p style={cs.navGroup}>PLAN</p>
              {navItems.slice(4,6).map(item => (
                <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ ...cs.navItem, ...(activeTab === item.id ? cs.navItemActive : {}) }}>
                  <span style={{ color: activeTab === item.id ? '#C9F04D' : '#555' }}>{item.icon}</span>{item.label}
                </button>
              ))}
              <p style={cs.navGroup}>ANALYSE</p>
              {navItems.slice(6,10).map(item => (
                <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ ...cs.navItem, ...(activeTab === item.id ? cs.navItemActive : {}) }}>
                  <span style={{ color: activeTab === item.id ? '#C9F04D' : '#555' }}>{item.icon}</span>{item.label}
                </button>
              ))}
            </nav>
          </div>
          <div style={cs.sidebarBottom}>
            <div style={cs.userInfo}>
              <div style={cs.avatar}>{user.email?.[0]?.toUpperCase() || 'U'}</div>
              <div><p style={cs.userEmail}>{user.email}</p><p style={cs.userRole}>Personal</p></div>
            </div>
            <button onClick={handleLogout} style={cs.logoutBtn}><IconLogout />&nbsp; Logout</button>
          </div>
        </aside>
      )}

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, paddingBottom: isMobile ? 70 : 0 }}>

        {/* Top Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '12px 16px' : '16px 40px', borderBottom: '1px solid #1a1a1a', background: '#0d0d0d', position: 'sticky', top: 0, zIndex: 10 }}>
          {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#C9F04D" /><path d="M8 20L14 12L19 17L24 10" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="24" cy="10" r="2" fill="#0a0a0a" /></svg>
              <span style={{ fontSize: 15, fontWeight: 700 }}>FinControl</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={prevMonth} style={cs.monthBtn}><IconChevL /></button>
            <span style={{ fontWeight: 700, fontSize: isMobile ? 13 : 15, minWidth: isMobile ? 110 : 150, textAlign: 'center' }}>
              {isMobile ? MONTHS[currentMonth].slice(0,3) : MONTHS[currentMonth]} {currentYear}
            </span>
            <button onClick={nextMonth} style={cs.monthBtn}><IconChevR /></button>
          </div>
          <button onClick={() => setShowTxModal(true)} style={{ ...cs.primaryBtn, padding: isMobile ? '8px 12px' : '10px 18px', fontSize: isMobile ? 12 : 14 }}>
            <IconPlus /> {isMobile ? 'Add' : 'New Transaction'}
          </button>
        </div>

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: contentPad }}>

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Balance',  value: fmtEur(totalBalance),              color: '#C9F04D', sub: `${accounts.length} accounts` },
                  { label: 'Income',   value: fmtEur(totalIncome),               color: '#4D9FF0', sub: MONTHS[currentMonth].slice(0,3) },
                  { label: 'Expenses', value: fmtEur(totalExpenses),             color: '#F04D4D', sub: MONTHS[currentMonth].slice(0,3) },
                  { label: 'Net',      value: fmtEur(totalIncome-totalExpenses), color: totalIncome-totalExpenses >= 0 ? '#4D9FF0' : '#F04D4D', sub: 'This month' },
                ].map(card => (
                  <div key={card.label} style={{ ...cs.statCard, borderTop: `3px solid ${card.color}` }}>
                    <p style={cs.statLabel}>{card.label}</p>
                    <p style={{ ...cs.statValue, color: card.color, fontSize: isMobile ? 16 : 22 }}>{card.value}</p>
                    <p style={cs.statSub}>{card.sub}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 14, marginBottom: 14 }}>
                <div style={{ ...cs.section, flex: 2 }}>
                  <h2 style={cs.sectionTitle}>Last 7 Days</h2>
                  {last7Days.every(d => d.expenses === 0 && d.income === 0) ? <div style={cs.chartEmpty}>No data yet</div> : (
                    <ResponsiveContainer width="100%" height={isMobile ? 140 : 175}>
                      <LineChart data={last7Days} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="label" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="expenses" stroke="#F04D4D" strokeWidth={2} dot={{ fill: '#F04D4D', r: 3 }} />
                        <Line type="monotone" dataKey="income"   stroke="#4D9FF0" strokeWidth={2} dot={{ fill: '#4D9FF0', r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                  <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: '#F04D4D', display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 2, background: '#F04D4D', display: 'inline-block' }} />Expenses</span>
                    <span style={{ fontSize: 11, color: '#4D9FF0', display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 2, background: '#4D9FF0', display: 'inline-block' }} />Income</span>
                  </div>
                </div>
                <div style={{ ...cs.section, flex: 1 }}>
                  <h2 style={cs.sectionTitle}>By Category</h2>
                  {expensesByCategory.length === 0 ? <div style={cs.chartEmpty}>No expenses</div> : (
                    <>
                      <ResponsiveContainer width="100%" height={isMobile ? 120 : 150}>
                        <PieChart>
                          <Pie data={expensesByCategory} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={2}>
                            {expensesByCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={v => fmtEur(v)} contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {expensesByCategory.slice(0, 4).map((c, i) => (
                          <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#aaa' }}>
                              <span style={{ width: 7, height: 7, borderRadius: '50%', background: PIE_COLORS[i%PIE_COLORS.length], display: 'inline-block' }} />{c.name}
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 600 }}>{fmtEur(c.value)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div style={cs.section}>
                <h2 style={cs.sectionTitle}>Last 6 Months</h2>
                <ResponsiveContainer width="100%" height={isMobile ? 130 : 160}>
                  <LineChart data={last6Months} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="label" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="expenses" stroke="#F04D4D" strokeWidth={2} dot={{ fill: '#F04D4D', r: 3 }} />
                    <Line type="monotone" dataKey="income"   stroke="#4D9FF0" strokeWidth={2} dot={{ fill: '#4D9FF0', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={cs.section}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h2 style={{ ...cs.sectionTitle, margin: 0 }}>Accounts</h2>
                  <button onClick={() => setShowModal(true)} style={cs.ghostBtn}><IconPlus /> New</button>
                </div>
                {accounts.length === 0 ? <p style={cs.muted}>No accounts yet.</p> : (
                  <div>
                    {accounts.map(acc => (
                      <div key={acc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1a1a1a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: accentColor(acc.type), display: 'inline-block' }} />
                          <div><p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{acc.name}</p><p style={{ margin: 0, fontSize: 11, color: '#555', textTransform: 'capitalize' }}>{acc.type}</p></div>
                        </div>
                        <span style={{ color: accentColor(acc.type), fontWeight: 700, fontSize: 15 }}>{fmtEur(acc.balance)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ACCOUNTS ── */}
          {activeTab === 'accounts' && (
            <div>
              <div style={cs.pageHeader}>
                <h1 style={{ ...cs.pageTitle, fontSize: isMobile ? 20 : 24 }}>Accounts</h1>
                <button onClick={() => setShowModal(true)} style={cs.primaryBtn}><IconPlus /> {isMobile ? 'New' : 'New Account'}</button>
              </div>
              {loading ? <p style={cs.muted}>Loading...</p> : accounts.length === 0
                ? <div style={cs.empty}><p>No accounts yet.</p><button onClick={() => setShowModal(true)} style={cs.primaryBtn}><IconPlus /> Create account</button></div>
                : <div style={cs.section}>
                    {accounts.map(acc => (
                      <div key={acc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #1a1a1a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: accentColor(acc.type), display: 'inline-block' }} />
                          <div><p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{acc.name}</p><p style={{ margin: 0, fontSize: 11, color: '#555', textTransform: 'capitalize' }}>{acc.type}</p></div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <span style={{ color: accentColor(acc.type), fontWeight: 700 }}>{fmtEur(acc.balance)}</span>
                          <button onClick={() => handleDelete(acc.id)} style={cs.deleteBtn}><IconTrash /></button>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}

          {/* ── TRANSACTIONS ── */}
          {activeTab === 'transactions' && (
            <div>
              <div style={cs.pageHeader}>
                <h1 style={{ ...cs.pageTitle, fontSize: isMobile ? 20 : 24 }}>Transactions</h1>
                <button onClick={() => setShowTxModal(true)} style={cs.primaryBtn}><IconPlus /> {isMobile ? 'New' : 'New Transaction'}</button>
              </div>
              {transactions.length === 0 ? <div style={cs.empty}><p style={cs.muted}>No transactions yet.</p></div> : (
                <div style={cs.section}>
                  {transactions.map(tx => {
                    const acc = accounts.find(a => a.id === tx.account_id)
                    const color = tx.type === 'income' ? '#4D9FF0' : '#F04D4D'
                    return (
                      <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1a1a1a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.category}</p>
                            <p style={{ margin: 0, fontSize: 11, color: '#555' }}>{acc?.name || '—'}{!isMobile && tx.description ? ` · ${tx.description}` : ''}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                          {!isMobile && <span style={{ fontSize: 12, color: '#555' }}>{tx.date ? new Date(tx.date).toLocaleDateString('pt-PT') : '—'}</span>}
                          <span style={{ color, fontWeight: 700, fontSize: 14 }}>{tx.type === 'income' ? '+' : '-'}{fmtEur(tx.amount)}</span>
                          <button onClick={() => handleDeleteTx(tx.id)} style={cs.deleteBtn}><IconTrash /></button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── BUDGETS ── */}
          {activeTab === 'budgets' && (
            <div>
              <div style={cs.pageHeader}>
                <h1 style={{ ...cs.pageTitle, fontSize: isMobile ? 20 : 24 }}>Budgets</h1>
                <button onClick={() => setShowBudgetModal(true)} style={cs.primaryBtn}><IconPlus /> {isMobile ? 'New' : 'New Budget'}</button>
              </div>
              {budgets.length === 0 ? (
                <div style={cs.empty}><p style={cs.muted}>No budgets for this month.</p><button onClick={() => setShowBudgetModal(true)} style={cs.primaryBtn}><IconPlus /> Create budget</button></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 12 }}>
                    <div style={cs.statCard}><p style={cs.statLabel}>Total Budget</p><p style={{ ...cs.statValue, fontSize: isMobile ? 16 : 20 }}>{fmtEur(budgets.reduce((s,b)=>s+Number(b.limit_amount),0))}</p></div>
                    <div style={cs.statCard}><p style={cs.statLabel}>Spent</p><p style={{ ...cs.statValue, color: '#F04D4D', fontSize: isMobile ? 16 : 20 }}>{fmtEur(budgets.reduce((s,b)=>s+Number(b.spent),0))}</p></div>
                  </div>
                  {budgets.map(b => {
                    const pct = Math.min(b.percentage, 100)
                    const isOver = b.percentage > 100
                    const barColor = isOver ? '#F04D4D' : pct > 80 ? '#F0A04D' : '#C9F04D'
                    return (
                      <div key={b.id} style={cs.section}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                              <span style={{ width: 8, height: 8, borderRadius: '50%', background: barColor, display: 'inline-block' }} />
                              <span style={{ fontSize: 15, fontWeight: 700 }}>{b.category}</span>
                            </div>
                            <span style={{ fontSize: 12, color: '#555' }}>{fmtEur(b.spent)} / {fmtEur(b.limit_amount)}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 13, color: isOver ? '#F04D4D' : '#4D9FF0', fontWeight: 600 }}>{isOver ? 'Over!' : `${fmtEur(Number(b.limit_amount)-Number(b.spent))} left`}</span>
                            <button onClick={() => handleDeleteBudget(b.id)} style={cs.deleteBtn}><IconTrash /></button>
                          </div>
                        </div>
                        <div style={{ background: '#1a1a1a', borderRadius: 6, height: 8, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 6, transition: 'width 0.5s ease' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 5 }}>
                          <span style={{ fontSize: 11, color: isOver ? '#F04D4D' : '#555', fontWeight: 600 }}>{b.percentage}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── GOALS ── */}
          {activeTab === 'goals' && (
            <div>
              <div style={cs.pageHeader}>
                <h1 style={{ ...cs.pageTitle, fontSize: isMobile ? 20 : 24 }}>Goals</h1>
                <button onClick={() => setShowGoalModal(true)} style={cs.primaryBtn}><IconPlus /> New Goal</button>
              </div>
              {goals.length === 0 ? (
                <div style={cs.empty}>
                  <p style={cs.muted}>No savings goals yet.</p>
                  <button onClick={() => setShowGoalModal(true)} style={cs.primaryBtn}><IconPlus /> Create goal</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Summary */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 12 }}>
                    <div style={cs.statCard}><p style={cs.statLabel}>Total Goals</p><p style={{ ...cs.statValue, fontSize: isMobile ? 16 : 20 }}>{goals.length}</p></div>
                    <div style={cs.statCard}><p style={cs.statLabel}>Total Target</p><p style={{ ...cs.statValue, fontSize: isMobile ? 16 : 20 }}>{fmtEur(goals.reduce((s,g)=>s+g.target,0))}</p></div>
                    <div style={cs.statCard}><p style={cs.statLabel}>Total Saved</p><p style={{ ...cs.statValue, color: '#4D9FF0', fontSize: isMobile ? 16 : 20 }}>{fmtEur(goals.reduce((s,g)=>s+g.saved,0))}</p></div>
                  </div>
                  {goals.map(goal => {
                    const pct = Math.min(Math.round((goal.saved / goal.target) * 100), 100)
                    const remaining = goal.target - goal.saved
                    const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / 86400000) : null
                    const barColor = pct >= 100 ? '#C9F04D' : pct > 60 ? '#4D9FF0' : '#F0A04D'
                    return (
                      <div key={goal.id} style={cs.section}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                          <div>
                            <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>{goal.name}</p>
                            <p style={{ margin: 0, fontSize: 12, color: '#555' }}>
                              {fmtEur(goal.saved)} saved of {fmtEur(goal.target)}
                              {daysLeft !== null && <span style={{ marginLeft: 10, color: daysLeft < 30 ? '#F04D4D' : '#555' }}>{daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}</span>}
                            </p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 20, fontWeight: 800, color: barColor }}>{pct}%</span>
                            <button onClick={() => handleDeleteGoal(goal.id)} style={cs.deleteBtn}><IconTrash /></button>
                          </div>
                        </div>
                        <div style={{ background: '#1a1a1a', borderRadius: 8, height: 10, overflow: 'hidden', marginBottom: 10 }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 8, transition: 'width 0.6s ease' }} />
                        </div>
                        {pct < 100 && <p style={{ margin: 0, fontSize: 12, color: '#555' }}>{fmtEur(remaining)} remaining</p>}
                        {pct >= 100 && <p style={{ margin: 0, fontSize: 12, color: '#C9F04D', fontWeight: 600 }}>🎉 Goal achieved!</p>}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── REPORTS ── */}
          {activeTab === 'reports' && (
            <div>
              <div style={cs.pageHeader}>
                <h1 style={{ ...cs.pageTitle, fontSize: isMobile ? 20 : 24 }}>Reports</h1>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['weekly','monthly','annual'].map(p => (
                    <button key={p} onClick={() => setReportPeriod(p)}
                      style={{ ...cs.tabBtn, ...(reportPeriod === p ? cs.tabBtnActive : {}) }}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 12, marginBottom: 16 }}>
                {(() => {
                  const rows = reportRows
                  const totalInc = rows.reduce((s,r)=>s+r.income,0)
                  const totalExp = rows.reduce((s,r)=>s+r.expenses,0)
                  return [
                    { label: 'Total Income',   value: fmtEur(totalInc),           color: '#4D9FF0' },
                    { label: 'Total Expenses', value: fmtEur(totalExp),            color: '#F04D4D' },
                    { label: 'Net Balance',    value: fmtEur(totalInc-totalExp),   color: totalInc-totalExp >= 0 ? '#C9F04D' : '#F04D4D' },
                    { label: 'Transactions',   value: rows.reduce((s,r)=>s+r.txCount,0), color: '#F0A04D' },
                  ].map(c => (
                    <div key={c.label} style={cs.statCard}>
                      <p style={cs.statLabel}>{c.label}</p>
                      <p style={{ ...cs.statValue, color: c.color, fontSize: isMobile ? 16 : 20 }}>{c.value}</p>
                    </div>
                  ))
                })()}
              </div>

              {/* Chart */}
              <div style={{ ...cs.section, marginBottom: 14 }}>
                <h2 style={cs.sectionTitle}>{reportPeriod === 'weekly' ? 'Weekly' : reportPeriod === 'monthly' ? 'Monthly' : 'Annual'} Overview</h2>
                <ResponsiveContainer width="100%" height={isMobile ? 140 : 200}>
                  <BarChart data={reportRows} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="label" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="income"   fill="#4D9FF0" radius={[4,4,0,0]} />
                    <Bar dataKey="expenses" fill="#F04D4D" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: '#4D9FF0', display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, background: '#4D9FF0', borderRadius: 2, display: 'inline-block' }} />Income</span>
                  <span style={{ fontSize: 11, color: '#F04D4D', display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, background: '#F04D4D', borderRadius: 2, display: 'inline-block' }} />Expenses</span>
                </div>
              </div>

              {/* Table */}
              <div style={cs.section}>
                <h2 style={cs.sectionTitle}>Detailed Table</h2>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr>
                        {[reportPeriod === 'weekly' ? 'Week' : reportPeriod === 'monthly' ? 'Month' : 'Year', 'Income', 'Expenses', 'Net', 'Txns'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: '#555', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid #1a1a1a' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportRows.map((row, i) => {
                        const net = row.income - row.expenses
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #141414' }}>
                            <td style={{ padding: '10px 10px', color: '#aaa', fontWeight: 500 }}>{row.label}</td>
                            <td style={{ padding: '10px 10px', color: '#4D9FF0', fontWeight: 600 }}>{fmtEur(row.income)}</td>
                            <td style={{ padding: '10px 10px', color: '#F04D4D', fontWeight: 600 }}>{fmtEur(row.expenses)}</td>
                            <td style={{ padding: '10px 10px', color: net >= 0 ? '#C9F04D' : '#F04D4D', fontWeight: 700 }}>{net >= 0 ? '+' : ''}{fmtEur(net)}</td>
                            <td style={{ padding: '10px 10px', color: '#555' }}>{row.txCount}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── CHARTS ── */}
          {activeTab === 'charts' && (
            <div>
              <div style={cs.pageHeader}>
                <h1 style={{ ...cs.pageTitle, fontSize: isMobile ? 20 : 24 }}>Charts</h1>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[['line','Line'],['bar','Bar'],['area','Area']].map(([v,l]) => (
                    <button key={v} onClick={() => setChartType(v)} style={{ ...cs.tabBtn, ...(chartType === v ? cs.tabBtnActive : {}) }}>{l}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[['7days','7 Days'],['6months','6 Months'],['12months','12 Months']].map(([v,l]) => (
                    <button key={v} onClick={() => setChartPeriod(v)} style={{ ...cs.tabBtn, ...(chartPeriod === v ? cs.tabBtnActive : {}) }}>{l}</button>
                  ))}
                </div>
              </div>

              {/* Main chart */}
              <div style={{ ...cs.section, marginBottom: 14 }}>
                <h2 style={cs.sectionTitle}>Income vs Expenses</h2>
                <ResponsiveContainer width="100%" height={isMobile ? 180 : 280}>
                  {chartType === 'bar' ? (
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="label" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend formatter={v => <span style={{ color: '#888', fontSize: 11 }}>{v}</span>} />
                      <Bar dataKey="income"   fill="#4D9FF0" radius={[4,4,0,0]} />
                      <Bar dataKey="expenses" fill="#F04D4D" radius={[4,4,0,0]} />
                    </BarChart>
                  ) : chartType === 'area' ? (
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4D9FF0" stopOpacity={0.3}/><stop offset="95%" stopColor="#4D9FF0" stopOpacity={0}/></linearGradient>
                        <linearGradient id="expGrad"    x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F04D4D" stopOpacity={0.3}/><stop offset="95%" stopColor="#F04D4D" stopOpacity={0}/></linearGradient>
                      </defs>
                      <XAxis dataKey="label" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="income"   stroke="#4D9FF0" fill="url(#incomeGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="expenses" stroke="#F04D4D" fill="url(#expGrad)"    strokeWidth={2} />
                    </AreaChart>
                  ) : (
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="label" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="income"   stroke="#4D9FF0" strokeWidth={2.5} dot={{ fill: '#4D9FF0', r: 4 }} />
                      <Line type="monotone" dataKey="expenses" stroke="#F04D4D" strokeWidth={2.5} dot={{ fill: '#F04D4D', r: 4 }} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
                  <span style={{ fontSize: 11, color: '#4D9FF0', display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 2, background: '#4D9FF0', display: 'inline-block' }} />Income</span>
                  <span style={{ fontSize: 11, color: '#F04D4D', display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 2, background: '#F04D4D', display: 'inline-block' }} />Expenses</span>
                </div>
              </div>

              {/* Pie chart */}
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 14 }}>
                <div style={{ ...cs.section, flex: 1 }}>
                  <h2 style={cs.sectionTitle}>Expenses by Category ({MONTHS[currentMonth].slice(0,3)})</h2>
                  {expensesByCategory.length === 0 ? <div style={cs.chartEmpty}>No data</div> : (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={expensesByCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" paddingAngle={3} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                          {expensesByCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={v => fmtEur(v)} contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div style={{ ...cs.section, flex: 1 }}>
                  <h2 style={cs.sectionTitle}>Net Balance Trend</h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={last6Months.map(d => ({ ...d, net: d.income - d.expenses }))} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#C9F04D" stopOpacity={0.3}/><stop offset="95%" stopColor="#C9F04D" stopOpacity={0}/></linearGradient>
                      </defs>
                      <XAxis dataKey="label" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="net" stroke="#C9F04D" fill="url(#netGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ── CATEGORIES ── */}
          {activeTab === 'categories' && (
            <div>
              <div style={cs.pageHeader}>
                <h1 style={{ ...cs.pageTitle, fontSize: isMobile ? 20 : 24 }}>Categories</h1>
                <button onClick={() => setShowCategoryModal(true)} style={cs.primaryBtn}><IconPlus /> New</button>
              </div>

              {/* Default categories */}
              <div style={{ ...cs.section, marginBottom: 14 }}>
                <h2 style={cs.sectionTitle}>Default Categories</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { name: 'Food & Drink', icon: '🍕', color: '#F0A04D', type: 'expense' },
                    { name: 'Transport', icon: '🚗', color: '#4D9FF0', type: 'expense' },
                    { name: 'Housing', icon: '🏠', color: '#A04DF0', type: 'expense' },
                    { name: 'Health', icon: '🏥', color: '#F04D4D', type: 'expense' },
                    { name: 'Education', icon: '📚', color: '#4DF0C9', type: 'expense' },
                    { name: 'Entertainment', icon: '🎮', color: '#C9F04D', type: 'expense' },
                    { name: 'Salary', icon: '💰', color: '#C9F04D', type: 'income' },
                    { name: 'Freelance', icon: '💻', color: '#4D9FF0', type: 'income' },
                    { name: 'Shopping', icon: '🛒', color: '#F04DA0', type: 'expense' },
                    { name: 'Utilities', icon: '💡', color: '#F0A04D', type: 'expense' },
                  ].map(cat => (
                    <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1a1a1a', border: `1px solid #2a2a2a`, borderRadius: 10, padding: '8px 14px' }}>
                      <span style={{ fontSize: 16 }}>{cat.icon}</span>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{cat.name}</p>
                        <p style={{ margin: 0, fontSize: 10, color: cat.type === 'income' ? '#4D9FF0' : '#F04D4D' }}>{cat.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom categories */}
              <div style={cs.section}>
                <h2 style={cs.sectionTitle}>Custom Categories ({categories.length})</h2>
                {categories.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 0' }}>
                    <p style={cs.muted}>No custom categories yet.</p>
                    <button onClick={() => setShowCategoryModal(true)} style={{ ...cs.ghostBtn, margin: '8px auto' }}><IconPlus /> Create category</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {categories.map(cat => (
                      <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1a1a1a', border: `1px solid ${cat.color}33`, borderRadius: 10, padding: '8px 14px' }}>
                        <span style={{ fontSize: 16 }}>{cat.icon}</span>
                        <div>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: cat.color }}>{cat.name}</p>
                          <p style={{ margin: 0, fontSize: 10, color: '#555' }}>{cat.type}</p>
                        </div>
                        <button onClick={() => handleDeleteCategory(cat.id)} style={{ ...cs.deleteBtn, marginLeft: 4 }}><IconTrash /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TOOLS ── */}
          {activeTab === 'tools' && (
            <div>
              <div style={cs.pageHeader}>
                <h1 style={{ ...cs.pageTitle, fontSize: isMobile ? 20 : 24 }}>Tools</h1>
              </div>

              {/* Export */}
              <div style={{ ...cs.section, marginBottom: 14 }}>
                <h2 style={cs.sectionTitle}>Export Data</h2>
                <p style={{ color: '#666', fontSize: 13, marginBottom: 16 }}>Download your financial data in different formats.</p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button onClick={exportCSV} style={{ ...cs.primaryBtn, gap: 8 }}>
                    <IconDownload /> Export Transactions (CSV)
                  </button>
                  <button onClick={exportJSON} style={{ ...cs.ghostBtn, gap: 8 }}>
                    <IconDownload /> Full Backup (JSON)
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div style={{ ...cs.section, marginBottom: 14 }}>
                <h2 style={cs.sectionTitle}>Data Summary</h2>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 12 }}>
                  {[
                    { label: 'Accounts',     value: accounts.length },
                    { label: 'Transactions', value: transactions.length },
                    { label: 'Budgets',      value: budgets.length },
                    { label: 'Goals',        value: goals.length },
                  ].map(s => (
                    <div key={s.label} style={{ background: '#1a1a1a', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
                      <p style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: '#C9F04D' }}>{s.value}</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#555', textTransform: 'uppercase' }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger zone */}
              <div style={{ ...cs.section, borderColor: '#F04D4D33' }}>
                <h2 style={{ ...cs.sectionTitle, color: '#F04D4D' }}>Danger Zone</h2>
                <p style={{ color: '#666', fontSize: 13, marginBottom: 16 }}>These actions are irreversible. Please proceed with caution.</p>
                <button
                  onClick={() => { if (confirm('Clear all goals and categories stored locally? This cannot be undone.')) { localStorage.removeItem('goals'); localStorage.removeItem('categories'); fetchGoals(); fetchCategories() } }}
                  style={{ background: 'transparent', border: '1px solid #F04D4D', color: '#F04D4D', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                  Clear Local Data (Goals & Categories)
                </button>
              </div>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {activeTab === 'settings' && (
            <div>
              <div style={cs.pageHeader}>
                <h1 style={{ ...cs.pageTitle, fontSize: isMobile ? 20 : 24 }}>Settings</h1>
              </div>

              <form onSubmit={handleSaveSettings}>
                <div style={{ ...cs.section, marginBottom: 14 }}>
                  <h2 style={cs.sectionTitle}>Profile</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#C9F04D', color: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800 }}>
                        {settingsForm.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: 15 }}>{settingsForm.name || settingsForm.email}</p>
                        <p style={{ margin: 0, fontSize: 12, color: '#555' }}>Personal account</p>
                      </div>
                    </div>
                    <div style={cs.field}><label style={cs.label}>Name</label><input style={cs.input} placeholder="Your name" value={settingsForm.name} onChange={e => setSettingsForm({ ...settingsForm, name: e.target.value })} /></div>
                    <div style={cs.field}><label style={cs.label}>Email</label><input style={cs.input} type="email" placeholder="your@email.com" value={settingsForm.email} onChange={e => setSettingsForm({ ...settingsForm, email: e.target.value })} /></div>
                  </div>
                </div>

                <div style={{ ...cs.section, marginBottom: 14 }}>
                  <h2 style={cs.sectionTitle}>Change Password</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
                    <div style={cs.field}><label style={cs.label}>New Password</label><input style={cs.input} type="password" placeholder="••••••••" value={settingsForm.password} onChange={e => setSettingsForm({ ...settingsForm, password: e.target.value })} /></div>
                    <div style={cs.field}><label style={cs.label}>Confirm Password</label><input style={cs.input} type="password" placeholder="••••••••" value={settingsForm.passwordConfirm} onChange={e => setSettingsForm({ ...settingsForm, passwordConfirm: e.target.value })} /></div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <button type="submit" style={cs.primaryBtn}>Save Changes</button>
                  {settingsSaved && <span style={{ color: '#C9F04D', fontSize: 13, fontWeight: 600 }}>✓ Changes saved!</span>}
                </div>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* Mobile Bottom Nav */}
      {isMobile && (
        <nav style={cs.bottomNav}>
          {mobileNavItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ ...cs.bottomNavItem, color: activeTab === item.id ? '#C9F04D' : '#444' }}>
              {item.icon}
              <span style={{ fontSize: 9, marginTop: 3 }}>{item.label}</span>
            </button>
          ))}
          <button onClick={() => setActiveTab('settings')} style={{ ...cs.bottomNavItem, color: activeTab === 'settings' ? '#C9F04D' : '#444' }}>
            <IconSettings />
            <span style={{ fontSize: 9, marginTop: 3 }}>More</span>
          </button>
        </nav>
      )}

      {showModal        && <CreateAccountModal     onClose={() => setShowModal(false)}        onCreated={fetchAccounts} />}
      {showTxModal      && <CreateTransactionModal  accounts={accounts} onClose={() => setShowTxModal(false)} onCreated={() => { fetchTransactions(); fetchAccounts(); fetchBudgets() }} />}
      {showBudgetModal  && <CreateBudgetModal       onClose={() => setShowBudgetModal(false)}  onCreated={fetchBudgets} />}
      {showGoalModal    && <CreateGoalModal         onClose={() => setShowGoalModal(false)}    onCreated={fetchGoals} />}
      {showCategoryModal && <CreateCategoryModal    onClose={() => setShowCategoryModal(false)} onCreated={fetchCategories} />}
    </div>
  )
}

const cs = {
  sidebar:       { width: '220px', flexShrink: 0, background: '#111', borderRight: '1px solid #1e1e1e', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 16px', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' },
  sidebarTop:    { display: 'flex', flexDirection: 'column', gap: '20px' },
  sidebarBottom: { display: 'flex', flexDirection: 'column', gap: '12px' },
  logo:          { display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px' },
  logoText:      { fontSize: '17px', fontWeight: '700', letterSpacing: '-0.3px' },
  nav:           { display: 'flex', flexDirection: 'column', gap: '2px' },
  navGroup:      { fontSize: '10px', fontWeight: '600', color: '#333', letterSpacing: '1px', padding: '10px 12px 4px', margin: 0 },
  navItem:       { display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#666', fontSize: '13px', fontWeight: '500', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: "'DM Sans', sans-serif" },
  navItemActive: { background: '#1a1a1a', color: '#f0f0f0' },
  userInfo:      { display: 'flex', alignItems: 'center', gap: '10px', padding: '0 4px' },
  avatar:        { width: '34px', height: '34px', borderRadius: '50%', background: '#C9F04D', color: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', flexShrink: 0 },
  userEmail:     { fontSize: '12px', color: '#aaa', margin: 0, maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userRole:      { fontSize: '11px', color: '#444', margin: 0 },
  logoutBtn:     { display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid #222', borderRadius: '8px', padding: '9px 12px', color: '#555', fontSize: '13px', cursor: 'pointer', width: '100%', fontFamily: "'DM Sans', sans-serif" },
  monthBtn:      { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '6px 10px', color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  pageHeader:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: 10 },
  pageTitle:     { fontWeight: '700', letterSpacing: '-0.5px', margin: 0 },
  primaryBtn:    { display: 'flex', alignItems: 'center', gap: '6px', background: '#C9F04D', color: '#0a0a0a', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  ghostBtn:      { display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', color: '#C9F04D', border: '1px solid #C9F04D', borderRadius: '8px', padding: '7px 12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  tabBtn:        { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '7px 14px', color: '#666', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  tabBtnActive:  { background: '#C9F04D22', border: '1px solid #C9F04D', color: '#C9F04D' },
  statCard:      { background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '16px' },
  statLabel:     { color: '#555', fontSize: '11px', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.6px' },
  statValue:     { color: '#C9F04D', fontWeight: '700', margin: '0 0 4px 0', letterSpacing: '-0.5px' },
  statSub:       { color: '#444', fontSize: '11px', margin: 0 },
  section:       { background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '18px', marginBottom: '14px' },
  sectionTitle:  { fontSize: '11px', fontWeight: '600', margin: '0 0 14px 0', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' },
  chartEmpty:    { color: '#333', fontSize: '13px', textAlign: 'center', padding: '30px 0' },
  deleteBtn:     { background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center' },
  muted:         { color: '#444', fontSize: '14px' },
  empty:         { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '60px 0', color: '#444' },
  overlay:       { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' },
  modal:         { background: '#111', border: '1px solid #222', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '420px', margin: '0 16px', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' },
  modalTitle:    { fontSize: '18px', fontWeight: '700', margin: 0 },
  iconBtn:       { background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', padding: '4px' },
  form:          { display: 'flex', flexDirection: 'column', gap: '16px' },
  field:         { display: 'flex', flexDirection: 'column', gap: '8px' },
  label:         { color: '#888', fontSize: '13px', fontWeight: '500' },
  input:         { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '11px 14px', color: '#f0f0f0', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" },
  error:         { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px 14px', color: '#f87171', fontSize: '13px', margin: 0 },
  submitBtn:     { background: '#C9F04D', color: '#0a0a0a', border: 'none', borderRadius: '8px', padding: '13px', fontSize: '15px', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' },
  bottomNav:     { position: 'fixed', bottom: 0, left: 0, right: 0, background: '#111', borderTop: '1px solid #1e1e1e', display: 'flex', justifyContent: 'space-around', padding: '10px 0 12px', zIndex: 20 },
  bottomNavItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 12px', fontFamily: "'DM Sans', sans-serif" },
}