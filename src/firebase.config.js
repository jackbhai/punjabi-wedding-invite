// ── Default Firebase web config, baked into the build.
// Runtime override order (first non-empty wins):
//   1. localStorage 'wed-invite-fb'  (Admin → Settings → "custom connection")
//   2. window.__FIREBASE_CONFIG__     (hosting-level injection)
//   3. DEFAULT_FIREBASE_CONFIG below  (this file)

export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCKIn_Ao5milLVk4er6Xtb4LMoTEECvFkc",
  authDomain: "neonsmm.firebaseapp.com",
  databaseURL: "https://neonsmm-default-rtdb.firebaseio.com",
  projectId: "neonsmm",
  storageBucket: "neonsmm.firebasestorage.app",
  messagingSenderId: "580115302882",
  appId: "1:580115302882:web:c3a00a219ed74af219d1bb",
  measurementId: "G-W0V1G9Q2W0",
}

export function hasBakedConfig() {
  return !!DEFAULT_FIREBASE_CONFIG.apiKey
}
