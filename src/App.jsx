import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { DEFAULT_CONFIG, DEFAULT_ADMIN_SLUG, mergeConfig } from './defaultConfig.js'
import { applyTheme, loadSavedThemeId } from './themes.js'
import {
  loadConfig, loadLocalConfig, saveConfigDoc, onAdminAuthChange,
} from './firebase.js'
import InvitePage from './pages/InvitePage.jsx'
import AdminLogin from './admin/AdminLogin.jsx'
import AdminPanel from './admin/AdminPanel.jsx'

const ConfigCtx = createContext(null)
export const useConfig = () => useContext(ConfigCtx)

const LOCAL_CFG_KEY = 'wed-invite-config'
function getHash() {
  return window.location.hash || '#/'
}

export default function App() {
  // Boot: defaults ← localStorage overrides (fast, works offline).
  const [config, setConfig] = useState(() => mergeConfig(DEFAULT_CONFIG, loadLocalConfig() || {}))
  const [saveState, setSaveState] = useState('cloud') // 'cloud' | 'local'
  const [route, setRoute] = useState(getHash)
  const [adminUser, setAdminUser] = useState(undefined) // undefined=checking, null=logged-out

  // Theme ASAP (no flash of wrong theme)
  useEffect(() => {
    const saved = loadLocalConfig()
    applyTheme(saved?.theme || loadSavedThemeId())
  }, [])

  // Cloud config → merge over local
  useEffect(() => {
    let alive = true
    loadConfig().then((remote) => {
      if (!alive) return
      if (remote && Object.keys(remote).length) {
        setConfig((prev) => {
          const merged = mergeConfig(DEFAULT_CONFIG, mergeConfig(prev, remote))
          applyTheme(merged.theme || loadSavedThemeId())
          return merged
        })
        setSaveState('cloud')
      } else {
        setSaveState('local')
      }
    })
    onAdminAuthChange((u) => alive && setAdminUser(u || null))
    return () => { alive = false }
  }, [])

  useEffect(() => {
    const onH = () => { setRoute(getHash()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', onH)
    return () => window.removeEventListener('hashchange', onH)
  }, [])

  const onPatch = useCallback(async (partial) => {
    let next = null
    setConfig((prev) => {
      next = mergeConfig(prev, partial)
      if (partial.theme) applyTheme(partial.theme)
      // always keep a boot-fast local copy (slug matching before cloud loads)
      try { localStorage.setItem(LOCAL_CFG_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
    const res = await saveConfigDoc(partial)
    setSaveState(res === 'cloud' ? 'cloud' : 'local')
  }, [])

  // ── Secret admin route. There is NO '#/admin' — wrong slug = public page. ──
  const m = route.match(/^#\/panel-([A-Za-z0-9]+)/)
  const slug = config.adminSlug || DEFAULT_ADMIN_SLUG
  const isAdminRoute = !!m && m[1] === slug

  return (
    <ConfigCtx.Provider value={{ config, onPatch, saveState }}>
      {isAdminRoute ? (
        adminUser === undefined ? (
          <div className="admin"><div className="admin-body" style={{ textAlign: 'center', paddingTop: 80 }}>Loading…</div></div>
        ) : adminUser ? (
          <AdminPanel
            config={config}
            onPatch={onPatch}
            saveState={saveState}
            user={adminUser}
            onLogout={() => setAdminUser(null)}
          />
        ) : (
          <AdminLogin onDone={() => { /* onAuthStateChanged flips to user */ }} />
        )
      ) : (
        <InvitePage />
      )}
    </ConfigCtx.Provider>
  )
}
