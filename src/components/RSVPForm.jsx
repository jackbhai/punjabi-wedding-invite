import { useState } from 'react'
import { motion } from 'framer-motion'
import { HeartIcon } from './icons.jsx'

// RSVP form → onSubmit({name, attending, guests, message})
export default function RSVPForm({
  onSubmit = async () => {},
  fields = { name: true, attending: true, guests: true, message: true },
  submitLabel = 'Send RSVP',
  sendingLabel = 'Sending…',
  successTitle = 'Shukriya!',
  successText = 'Your RSVP has been received. We look forward to celebrating with you.',
  maxGuests = 10,
  className = '',
}) {
  const [name, setName] = useState('')
  const [attending, setAttending] = useState('yes')
  const [guests, setGuests] = useState(1)
  const [message, setMessage] = useState('')
  const [state, setState] = useState('idle') // idle | sending | done | error
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('Please tell us your name.'); return }
    setError('')
    setState('sending')
    try {
      await onSubmit({ name: name.trim(), attending, guests: Number(guests) || 1, message: message.trim() })
      setState('done')
    } catch (err) {
      setState('error')
      setError(err?.message || 'Something went wrong. Please try again.')
    }
  }

  if (state === 'done') {
    return (
      <motion.div className="gcard" style={{ textAlign: 'center' }}
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div style={{ color: 'var(--gold-deep, #9a7b1e)', display: 'flex', justifyContent: 'center' }}>
          <HeartIcon size={54} />
        </div>
        <h3 className="font-script" style={{ fontSize: 38, color: 'var(--primary)', margin: '8px 0' }}>{successTitle}</h3>
        <p style={{ color: 'var(--muted)' }}>{successText}</p>
      </motion.div>
    )
  }

  return (
    <motion.form
      className={`gcard ${className}`} onSubmit={submit}
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.55 }}
    >
      {fields.name && (
        <div className="field">
          <label htmlFor="rsvp-name">Your Name *</label>
          <input id="rsvp-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul Sharma" autoComplete="name" />
        </div>
      )}
      {fields.attending && (
        <div className="field">
          <label>Will you attend?</label>
          <div className="seg" role="radiogroup" aria-label="Attending">
            <button type="button" className={attending === 'yes' ? 'on' : ''} onClick={() => setAttending('yes')}>Joyfully accepts</button>
            <button type="button" className={attending === 'no' ? 'on' : ''} onClick={() => setAttending('no')}>Regretfully declines</button>
          </div>
        </div>
      )}
      {fields.guests && (
        <div className="field">
          <label htmlFor="rsvp-guests">Number of Guests</label>
          <select id="rsvp-guests" value={guests} onChange={(e) => setGuests(e.target.value)}>
            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
            ))}
          </select>
        </div>
      )}
      {fields.message && (
        <div className="field">
          <label htmlFor="rsvp-msg">Blessings / Message</label>
          <textarea id="rsvp-msg" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your blessings and wishes…" rows={3} />
        </div>
      )}
      {error && <p style={{ color: '#e05252', fontSize: 13.5, margin: '0 0 10px' }}>{error}</p>}
      <button className="btn" type="submit" disabled={state === 'sending'} style={{ width: '100%' }}>
        {state === 'sending' ? sendingLabel : submitLabel}
      </button>
      {state === 'error' && <p style={{ color: '#e05252', fontSize: 13 }}>Please try again.</p>}
    </motion.form>
  )
}
