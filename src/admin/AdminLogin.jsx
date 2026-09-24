import { useState } from 'react'
import { adminSignIn, hasFirebaseConfig } from '../firebase.js'

// Email + password gate for the admin panel.
export default function AdminLogin({ onDone }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      await adminSignIn(email.trim(), password)
      onDone?.()
    } catch (e2) {
      setErr(e2?.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin">
      <div className="admin-body">
        <div className="acard login-box">
          <h3 style={{ fontSize: 22 }}>🔐 Admin Login</h3>
          <p className="hint">Sirf admin ke liye — Firebase Auth email + password.</p>
          {!hasFirebaseConfig() && (
            <div className="offline-bar">
              ⚠️ Firebase config nahi mili. Pehle <b>Settings → Firebase Setup</b> me config
              paste karke save karo, tab login kaam karega.
            </div>
          )}
          <form onSubmit={submit}>
            <div className="afield">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" autoComplete="email" required />
            </div>
            <div className="afield">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" required />
            </div>
            {err && <p style={{ color: '#f87171', fontSize: 13 }}>{err}</p>}
            <button className="abtn" type="submit" disabled={busy} style={{ width: '100%', justifyContent: 'center' }}>
              {busy ? 'Logging in…' : 'Login'}
            </button>
          </form>
          <p className="hint" style={{ marginTop: 14, marginBottom: 0 }}>
            Admin user Firebase Console → Authentication me banta hai. Steps: README me dekho.
          </p>
        </div>
      </div>
    </div>
  )
}
