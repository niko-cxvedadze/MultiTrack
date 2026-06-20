import { Input, Popover } from 'antd'
import { icons } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface IconPickerProps {
  value?: string
  onChange?: (iconName: string | undefined) => void
}

const ALL_ICON_NAMES = Object.keys(icons)

export function IconPicker({ value, onChange }: IconPickerProps) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!search.trim()) return ALL_ICON_NAMES
    const q = search.toLowerCase()
    return ALL_ICON_NAMES.filter((name) => name.toLowerCase().includes(q))
  }, [search])

  const SelectedIcon = value ? icons[value as keyof typeof icons] : null

  const grid = (
    <div style={{ width: 320 }}>
      <Input
        placeholder={t('categories.iconSearchPlaceholder')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        allowClear
        autoFocus
        style={{ marginBottom: 8 }}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 4,
          maxHeight: 260,
          overflowY: 'auto',
          padding: 2,
        }}
      >
        {filtered.map((name) => {
          const Icon = icons[name as keyof typeof icons]
          if (!Icon) return null
          const isSelected = value === name
          return (
            <button
              key={name}
              type="button"
              title={name}
              onClick={() => {
                onChange?.(isSelected ? undefined : name)
                if (!isSelected) setOpen(false)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                border: isSelected ? '2px solid #1677ff' : '1px solid transparent',
                borderRadius: 6,
                background: isSelected ? '#e6f4ff' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.background = '#f5f5f5'
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.background = 'transparent'
              }}
            >
              <Icon size={20} />
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <Popover
      content={grid}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomLeft"
    >
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          height: 48,
          width: '100%',
          padding: '0 12px',
          border: '1px solid #d9d9d9',
          borderRadius: 6,
          background: '#fff',
          cursor: 'pointer',
          transition: 'border-color 0.2s',
        }}
      >
        {SelectedIcon ? (
          <>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 6,
              background: '#f0f0f0',
            }}>
              <SelectedIcon size={20} />
            </span>
            <span style={{ fontSize: 13, color: '#333' }}>{value}</span>
          </>
        ) : (
          <span style={{ fontSize: 13, color: '#bfbfbf' }}>
            {t('categories.iconSearchPlaceholder')}
          </span>
        )}
      </button>
    </Popover>
  )
}
