import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listAccounts, createAccount, deleteAccount } from '../api/accounts'
import { listTransactions, createTransaction, deleteTransaction } from '../api/transactions'
import { listBudgets, createBudget, deleteBudget } from '../api/budgets'

// ── Icons ────────────────────────────────────────────────────────────────────
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

// ── Mini Bar Chart ────────────────────────────────────────────────────────────
function BarChart({ accounts }) {
  if (!accounts.length) return (
    <div style={cs.chartEmpty}>No accounts to display</div>
  )
  const max = Math.max(...accounts.map(a => Math.abs(a.balance)), 1)
  return (
    <div style={cs.chartWrap}>
      {accounts.map((acc, i) => (
        <div key={acc.id} style={cs.barGroup}>
          <div style={cs.barTrack}>
            <div style={{
              ...cs.bar,
              height: `${Math.max(8, (Math.abs(acc.balance) / max) * 100)}%`,
              background: ['#C9F04D', '#4D9FF0', '#F04DA0', '#F0A04D'][i % 4]
            }} />
          </div>
          <span style={cs.barLabel}>{acc.name.slice(0, 6)}</span>
        </div>
      ))}
    </div>
  )
}

// ── Create Account Modal ──────────────────────────────────────────────────────
function CreateAccountModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', type: 'current', balance: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await createAccount(form.name, form.type, parseFloat(form.balance) || 0)
      onCreated()
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={cs.overlay} onClick={onClose}>
      <div style={cs.modal} onClick={e => e.stopPropagation()}>
        <div style={cs.modalHeader}>
          <h2 style={cs.modalTitle}>New Account</h2>
          <button onClick={onClose} style={cs.iconBtn}><IconClose /></button>
        </div>
        <form onSubmit={handleSubmit} style={cs.form}>
          <div style={cs.field}>
            <label style={cs.label}>Account Name</label>
            <input style={cs.input} placeholder="e.g. Main Account"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div style={cs.field}>
            <label style={cs.label}>Type</label>
            <select style={cs.input} value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="current">Current</option>
              <option value="saving">Saving</option>
              <option value="investment">Investment</option>
            </select>
          </div>
          <div style={cs.field}>
            <label style={cs.label}>Initial Balance (€)</label>
            <input style={cs.input} type="number" step="0.01" placeholder="0.00"
              value={form.balance} onChange={e => setForm({ ...form, balance: e.target.value })} />
          </div>
          {error && <p style={cs.error}>{error}</p>}
          <button type="submit" disabled={loading} style={{
            ...cs.submitBtn, opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Account Card ──────────────────────────────────────────────────────────────
function AccountCard({ account, onDelete }) {
  const colors = { current: '#C9F04D', saving: '#4D9FF0', investment: '#F0A04D' }
  const color = colors[account.type] || '#C9F04D'
  return (
    <div style={cs.accountCard}>
      <div style={{ ...cs.accountDot, background: color }} />
      <div style={cs.accountInfo}>
        <span style={cs.accountName}>{account.name}</span>
        <span style={cs.accountType}>{account.type}</span>
      </div>
      <div style={cs.accountRight}>
        <span style={{ ...cs.accountBalance, color }}>
          €{Number(account.balance).toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
        </span>
        <button onClick={() => onDelete(account.id)} style={cs.deleteBtn}><IconTrash /></button>
      </div>
    </div>
  )
}

// ── Create Budget Modal ───────────────────────────────────────────────────────
function CreateBudgetModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ category: '', limit_amount: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await createBudget(form.category, parseFloat(form.limit_amount))
      await onCreated()
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create budget.')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div style={cs.overlay} onClick={onClose}>
      <div style={cs.modal} onClick={e => e.stopPropagation()}>
        <div style={cs.modalHeader}>
          <h2 style={cs.modalTitle}>New Budget</h2>
          <button onClick={onClose} style={cs.iconBtn}><IconClose /></button>
        </div>
        <form onSubmit={handleSubmit} style={cs.form}>
          <div style={cs.field}>
            <label style={cs.label}>Category</label>
            <input style={cs.input} placeholder="e.g. Food, Transport, Entertainment..."
              value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required />
          </div>
          <div style={cs.field}>
            <label style={cs.label}>Monthly Limit (€)</label>
            <input style={cs.input} type="number" step="0.01" placeholder="0.00"
              value={form.limit_amount} onChange={e => setForm({ ...form, limit_amount: e.target.value })} required />
          </div>
          {error && <p style={cs.error}>{error}</p>}
          <button type="submit" disabled={loading} style={{
            ...cs.submitBtn, opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}>
            {loading ? 'Creating...' : 'Create Budget'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Create Transaction Modal ──────────────────────────────────────────────────
function CreateTransactionModal({ accounts, onClose, onCreated }) {
  const [form, setForm] = useState({
    account_id: accounts[0]?.id || '',
    type: 'expense',
    category: '',
    amount: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await createTransaction({
        account_id: parseInt(form.account_id),
        type: form.type,
        category: form.category,
        amount: parseFloat(form.amount),
        description: form.description || null
      })
      onCreated()
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create transaction.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={cs.overlay} onClick={onClose}>
      <div style={cs.modal} onClick={e => e.stopPropagation()}>
        <div style={cs.modalHeader}>
          <h2 style={cs.modalTitle}>New Transaction</h2>
          <button onClick={onClose} style={cs.iconBtn}><IconClose /></button>
        </div>
        <form onSubmit={handleSubmit} style={cs.form}>
          <div style={cs.field}>
            <label style={cs.label}>Account</label>
            <select style={cs.input} value={form.account_id}
              onChange={e => setForm({ ...form, account_id: e.target.value })}>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} (€{Number(acc.balance).toFixed(2)})</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={cs.field}>
              <label style={cs.label}>Type</label>
              <select style={cs.input} value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div style={cs.field}>
              <label style={cs.label}>Amount (€)</label>
              <input style={cs.input} type="number" step="0.01" placeholder="0.00"
                value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
            </div>
          </div>
          <div style={cs.field}>
            <label style={cs.label}>Category</label>
            <input style={cs.input} placeholder="e.g. Food, Salary, Rent..."
              value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required />
          </div>
          <div style={cs.field}>
            <label style={cs.label}>Description <span style={{ color: '#444', fontSize: '11px' }}>(optional)</span></label>
            <input style={cs.input} placeholder="Add a note..."
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          {error && <p style={cs.error}>{error}</p>}
          <button type="submit" disabled={loading} style={{
            ...cs.submitBtn, opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}>
            {loading ? 'Saving...' : 'Save Transaction'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [activeTab, setActiveTab] = useState('overview')
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showTxModal, setShowTxModal] = useState(false)
  const [showBudgetModal, setShowBudgetModal] = useState(false)

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0)

  const fetchAccounts = async () => {
    try {
      const data = await listAccounts()
      setAccounts(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const fetchTransactions = async () => {
    try {
      const data = await listTransactions()
      setTransactions(data)
    } catch (e) { console.error(e) }
  }

  const fetchBudgets = async () => {
    try {
      const data = await listBudgets()
      setBudgets(data)
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
  const loadAll = async () => {
    await fetchAccounts()
    await fetchTransactions()
    await fetchBudgets()
  }
  loadAll()
  }, [])
  
  const handleDelete = async (id) => {
    if (!confirm('Delete this account?')) return
    try { await deleteAccount(id); fetchAccounts() }
    catch (e) { alert('Failed to delete account.') }
  }

  const handleDeleteTx = async (id) => {
    if (!confirm('Delete this transaction?')) return
    try {
      await deleteTransaction(id)
      fetchTransactions()
      fetchAccounts()
    } catch (e) { alert('Failed to delete transaction.') }
  }

  const handleDeleteBudget = async (id) => {
    if (!confirm('Delete this budget?')) return
    try {
      await deleteBudget(id)
      fetchBudgets()
    } catch (e) { alert('Failed to delete budget.') }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const navItems = [
    { id: 'overview',      label: 'Overview',      icon: <IconHome /> },
    { id: 'accounts',      label: 'Accounts',      icon: <IconWallet /> },
    { id: 'transactions',  label: 'Transactions',  icon: <IconTx /> },
    { id: 'budgets',       label: 'Budgets',       icon: <IconTrend /> },
  ]

  return (
    <div style={cs.page}>
      {/* Sidebar */}
      <aside style={cs.sidebar}>
        <div style={cs.sidebarTop}>
          <div style={cs.logo}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#C9F04D" />
              <path d="M8 20L14 12L19 17L24 10" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="24" cy="10" r="2" fill="#0a0a0a" />
            </svg>
            <span style={cs.logoText}>FinControl</span>
          </div>
          <nav style={cs.nav}>
            {navItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                style={{ ...cs.navItem, ...(activeTab === item.id ? cs.navItemActive : {}) }}>
                <span style={{ color: activeTab === item.id ? '#C9F04D' : '#555' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div style={cs.sidebarBottom}>
          <div style={cs.userInfo}>
            <div style={cs.avatar}>{user.email?.[0]?.toUpperCase() || 'U'}</div>
            <div>
              <p style={cs.userEmail}>{user.email}</p>
              <p style={cs.userRole}>Personal</p>
            </div>
          </div>
          <button onClick={handleLogout} style={cs.logoutBtn}>
            <IconLogout />&nbsp; Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={cs.main}>
        {activeTab === 'overview' && (
          <div style={cs.content}>
            <div style={cs.pageHeader}>
              <h1 style={cs.pageTitle}>Overview</h1>
              <button onClick={() => setShowModal(true)} style={cs.primaryBtn}><IconPlus /> New Account</button>
            </div>
            <div style={cs.statsGrid}>
              <div style={cs.statCard}>
                <p style={cs.statLabel}>Total Balance</p>
                <p style={cs.statValue}>€{totalBalance.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</p>
                <p style={cs.statSub}>{accounts.length} accounts</p>
              </div>
              <div style={cs.statCard}>
                <p style={cs.statLabel}>Saving Accounts</p>
                <p style={{ ...cs.statValue, color: '#4D9FF0' }}>{accounts.filter(a => a.type === 'saving').length}</p>
                <p style={cs.statSub}>accounts</p>
              </div>
              <div style={cs.statCard}>
                <p style={cs.statLabel}>Investments</p>
                <p style={{ ...cs.statValue, color: '#F0A04D' }}>{accounts.filter(a => a.type === 'investment').length}</p>
                <p style={cs.statSub}>accounts</p>
              </div>
            </div>
            <div style={cs.section}>
              <h2 style={cs.sectionTitle}>Balance by Account</h2>
              {loading ? <p style={cs.muted}>Loading...</p> : <BarChart accounts={accounts} />}
            </div>
            <div style={cs.section}>
              <h2 style={cs.sectionTitle}>Your Accounts</h2>
              {loading ? <p style={cs.muted}>Loading...</p> : accounts.length === 0 ? (
                <div style={cs.empty}>
                  <p>No accounts yet.</p>
                  <button onClick={() => setShowModal(true)} style={cs.primaryBtn}><IconPlus /> Create your first account</button>
                </div>
              ) : (
                <div style={cs.accountList}>
                  {accounts.map(acc => <AccountCard key={acc.id} account={acc} onDelete={handleDelete} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'accounts' && (
          <div style={cs.content}>
            <div style={cs.pageHeader}>
              <h1 style={cs.pageTitle}>Accounts</h1>
              <button onClick={() => setShowModal(true)} style={cs.primaryBtn}><IconPlus /> New Account</button>
            </div>
            {loading ? <p style={cs.muted}>Loading...</p> : accounts.length === 0 ? (
              <div style={cs.empty}>
                <p>No accounts yet.</p>
                <button onClick={() => setShowModal(true)} style={cs.primaryBtn}><IconPlus /> Create your first account</button>
              </div>
            ) : (
              <div style={cs.accountList}>
                {accounts.map(acc => <AccountCard key={acc.id} account={acc} onDelete={handleDelete} />)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div style={cs.content}>
            <div style={cs.pageHeader}>
              <h1 style={cs.pageTitle}>Transactions</h1>
              <button onClick={() => setShowTxModal(true)} style={cs.primaryBtn}><IconPlus /> New Transaction</button>
            </div>
            {transactions.length === 0 ? (
              <div style={cs.empty}><p style={cs.muted}>No transactions yet.</p></div>
            ) : (
              <div style={cs.section}>
                <div style={cs.accountList}>
                  {transactions.map(tx => {
                    const acc = accounts.find(a => a.id === tx.account_id)
                    return (
                      <div key={tx.id} style={cs.accountCard}>
                        <div style={{
                          ...cs.accountDot,
                          background: tx.type === 'income' ? '#4D9FF0' : '#F04D4D'
                        }} />
                        <div style={cs.accountInfo}>
                          <span style={cs.accountName}>{tx.category}</span>
                          <span style={cs.accountType}>{acc?.name || 'Unknown'} · {tx.description || '—'}</span>
                        </div>
                        <div style={cs.accountRight}>
                          <span style={{
                            ...cs.accountBalance,
                            color: tx.type === 'income' ? '#4D9FF0' : '#F04D4D'
                          }}>
                            {tx.type === 'income' ? '+' : '-'}€{Number(tx.amount).toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
                          </span>
                          <span style={{ fontSize: '11px', color: '#444' }}>
                            {new Date(tx.date).toLocaleDateString('pt-PT')}
                          </span>
                          <button onClick={() => handleDeleteTx(tx.id)} style={cs.deleteBtn}><IconTrash /></button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'budgets' && (
          <div style={cs.content}>
            <div style={cs.pageHeader}>
              <h1 style={cs.pageTitle}>Budgets</h1>
              <button onClick={() => setShowBudgetModal(true)} style={cs.primaryBtn}><IconPlus /> New Budget</button>
            </div>
            {budgets.length === 0 ? (
              <div style={cs.empty}>
                <p style={cs.muted}>No budgets for this month.</p>
                <button onClick={() => setShowBudgetModal(true)} style={cs.primaryBtn}><IconPlus /> Create your first budget</button>
              </div>
            ) : (
              <div style={cs.accountList}>
                {budgets.map(b => {
                  const pct = Math.min(b.percentage, 100)
                  const isOver = b.percentage > 100
                  const barColor = isOver ? '#F04D4D' : pct > 80 ? '#F0A04D' : '#C9F04D'
                  return (
                    <div key={b.id} style={cs.section}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div>
                          <span style={{ fontSize: '15px', fontWeight: '600' }}>{b.category}</span>
                          <span style={{ fontSize: '12px', color: '#555', marginLeft: '10px' }}>
                            €{Number(b.spent).toFixed(2)} / €{Number(b.limit_amount).toFixed(2)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '13px', color: isOver ? '#F04D4D' : '#555' }}>
                            €{Math.max(0, Number(b.limit_amount) - b.spent).toFixed(2)} left
                          </span>
                          <button onClick={() => handleDeleteBudget(b.id)} style={cs.deleteBtn}><IconTrash /></button>
                        </div>
                      </div>
                      <div style={{ background: '#1a1a1a', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct}%`, height: '100%',
                          background: barColor, borderRadius: '4px',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                        <span style={{ fontSize: '11px', color: isOver ? '#F04D4D' : '#555' }}>{b.percentage}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {showModal && <CreateAccountModal onClose={() => setShowModal(false)} onCreated={fetchAccounts} />}
      {showTxModal && <CreateTransactionModal accounts={accounts} onClose={() => setShowTxModal(false)} onCreated={() => { fetchTransactions(); fetchAccounts() }} />}
      {showBudgetModal && <CreateBudgetModal onClose={() => setShowBudgetModal(false)} onCreated={fetchBudgets} />}
    </div>
  )
}

const cs = {
  page: { display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: '#f0f0f0', fontFamily: "'DM Sans', sans-serif" },
  sidebar: { width: '240px', flexShrink: 0, background: '#111', borderRight: '1px solid #1e1e1e', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 16px', position: 'sticky', top: 0, height: '100vh' },
  sidebarTop: { display: 'flex', flexDirection: 'column', gap: '32px' },
  sidebarBottom: { display: 'flex', flexDirection: 'column', gap: '12px' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px' },
  logoText: { fontSize: '17px', fontWeight: '700', letterSpacing: '-0.3px' },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px' },
  navItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#666', fontSize: '14px', fontWeight: '500', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: "'DM Sans', sans-serif" },
  navItemActive: { background: '#1a1a1a', color: '#f0f0f0' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px', padding: '0 4px' },
  avatar: { width: '34px', height: '34px', borderRadius: '50%', background: '#C9F04D', color: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', flexShrink: 0 },
  userEmail: { fontSize: '12px', color: '#aaa', margin: 0, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userRole: { fontSize: '11px', color: '#444', margin: 0 },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid #222', borderRadius: '8px', padding: '9px 12px', color: '#555', fontSize: '13px', cursor: 'pointer', width: '100%', fontFamily: "'DM Sans', sans-serif" },
  main: { flex: 1, overflowY: 'auto' },
  content: { padding: '32px 40px', maxWidth: '900px' },
  pageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' },
  pageTitle: { fontSize: '26px', fontWeight: '700', letterSpacing: '-0.5px', margin: 0 },
  primaryBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: '#C9F04D', color: '#0a0a0a', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' },
  statCard: { background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '20px' },
  statLabel: { color: '#555', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' },
  statValue: { color: '#C9F04D', fontSize: '28px', fontWeight: '700', margin: '0 0 4px 0', letterSpacing: '-1px' },
  statSub: { color: '#444', fontSize: '12px', margin: 0 },
  section: { background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '24px', marginBottom: '20px' },
  sectionTitle: { fontSize: '15px', fontWeight: '600', margin: '0 0 20px 0', color: '#aaa' },
  chartWrap: { display: 'flex', alignItems: 'flex-end', gap: '12px', height: '120px' },
  chartEmpty: { color: '#444', fontSize: '14px', textAlign: 'center', padding: '40px 0' },
  barGroup: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 },
  barTrack: { width: '100%', height: '100px', display: 'flex', alignItems: 'flex-end', borderRadius: '4px', background: '#1a1a1a' },
  bar: { width: '100%', borderRadius: '4px 4px 0 0', transition: 'height 0.4s ease' },
  barLabel: { fontSize: '11px', color: '#555' },
  accountList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  accountCard: { display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: '#161616', border: '1px solid #222', borderRadius: '10px' },
  accountDot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
  accountInfo: { display: 'flex', flexDirection: 'column', flex: 1 },
  accountName: { fontSize: '14px', fontWeight: '600' },
  accountType: { fontSize: '12px', color: '#555', textTransform: 'capitalize' },
  accountRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  accountBalance: { fontSize: '16px', fontWeight: '700', letterSpacing: '-0.3px' },
  deleteBtn: { background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center' },
  muted: { color: '#444', fontSize: '14px' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '60px 0', color: '#444' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' },
  modal: { background: '#111', border: '1px solid #222', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '420px' },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' },
  modalTitle: { fontSize: '20px', fontWeight: '700', margin: 0, letterSpacing: '-0.3px' },
  iconBtn: { background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', padding: '4px' },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { color: '#888', fontSize: '13px', fontWeight: '500' },
  input: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '11px 14px', color: '#f0f0f0', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" },
  error: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px 14px', color: '#f87171', fontSize: '13px', margin: 0 },
  submitBtn: { background: '#C9F04D', color: '#0a0a0a', border: 'none', borderRadius: '8px', padding: '13px', fontSize: '15px', fontWeight: '700', fontFamily: "'DM Sans', sans-serif" },
}