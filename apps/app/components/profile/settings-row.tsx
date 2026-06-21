'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SettingsRowProps {
  label: string
  value?: string
  /** When provided, the row becomes editable with a "Change" button. Receives the new value. */
  onSave?: (value: string) => Promise<void>
  /** Custom element rendered on the right side (e.g. Switch). Mutually exclusive with onSave. */
  action?: React.ReactNode
}

export function SettingsRow({ label, value, onSave, action }: SettingsRowProps) {
  const t = useTranslations('profile')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await onSave?.(draft)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <div className="py-5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="mt-2 flex items-center gap-3">
          <Input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') {
                setDraft(value ?? '')
                setEditing(false)
              }
            }}
            className="max-w-xs"
          />
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {t('save')}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setDraft(value ?? '')
              setEditing(false)
            }}
          >
            {t('cancel')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between py-5">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        {value !== undefined && <p className="mt-0.5 text-sm">{value || t('notSet')}</p>}
      </div>
      {action ?? (onSave && (
        <Button
          variant="ghost"
          size="sm"
          className="text-primary"
          onClick={() => {
            setDraft(value ?? '')
            setEditing(true)
          }}
        >
          {t('change')}
        </Button>
      ))}
    </div>
  )
}
