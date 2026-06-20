import { Form, Input, Tabs, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { LOCALE_NAMES, SUPPORTED_LOCALES } from '@repo/types'

export interface TranslatableField {
  name: string
  label: string
  placeholder: string
  type?: 'input' | 'textarea'
  rows?: number
  maxLength?: number
  showCount?: boolean
}

interface TranslationTabsProps {
  fields: TranslatableField[]
  onNameChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function TranslationTabs({ fields, onNameChange }: TranslationTabsProps) {
  const { t } = useTranslation()

  return (
    <Tabs
      defaultActiveKey="ka"
      size="small"
      destroyInactiveTabPane={false}
      items={SUPPORTED_LOCALES.map((locale) => ({
        key: locale,
        label: LOCALE_NAMES[locale],
        forceRender: true,
        children:
          locale === 'ka' ? (
            <>
              {fields.map((field) => (
                <Form.Item
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  rules={
                    field.name === 'name'
                      ? [{ required: true, message: t('products.nameRequired') }]
                      : undefined
                  }
                >
                  {field.type === 'textarea' ? (
                    <Input.TextArea
                      rows={field.rows ?? 3}
                      maxLength={field.maxLength}
                      showCount={field.showCount}
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <Input
                      maxLength={field.maxLength}
                      showCount={field.showCount}
                      placeholder={field.placeholder}
                      onChange={field.name === 'name' ? onNameChange : undefined}
                    />
                  )}
                </Form.Item>
              ))}
            </>
          ) : (
            <>
              <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                {t('translations.optional')}
              </Typography.Text>
              {fields.map((field) => (
                <Form.Item
                  key={`translations_${locale}_${field.name}`}
                  name={`translations_${locale}_${field.name}`}
                  label={field.label}
                >
                  {field.type === 'textarea' ? (
                    <Input.TextArea
                      rows={field.rows ?? 3}
                      maxLength={field.maxLength}
                      showCount={field.showCount}
                      placeholder={`${field.placeholder} (${LOCALE_NAMES[locale]})`}
                    />
                  ) : (
                    <Input
                      maxLength={field.maxLength}
                      showCount={field.showCount}
                      placeholder={`${field.placeholder} (${LOCALE_NAMES[locale]})`}
                    />
                  )}
                </Form.Item>
              ))}
            </>
          ),
      }))}
    />
  )
}
