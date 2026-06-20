import { useEffect } from 'react'

import { ArrowLeftOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'
import { Avatar, Button, Card, Empty, Spin, Tag, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

import { usePageHeader, useUserDetail } from '@/hooks'
import { adminRoutes } from '@/routes'

export function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setHeader } = usePageHeader()
  const { user, isLoading } = useUserDetail(id)

  useEffect(() => {
    setHeader(
      <span className="flex items-center gap-2">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(adminRoutes.users())}
        />
        {user?.fullName || t('users.detail')}
      </span>
    )
  }, [t, setHeader, user?.fullName, navigate])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spin size="large" />
      </div>
    )
  }

  if (!user) {
    return <Empty description={t('users.notFound')} />
  }

  const initials = user.fullName
    ?.split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex items-center gap-4">
          <Avatar size={64} style={{ backgroundColor: '#5B5FC7', fontSize: 24 }}>
            {initials || '?'}
          </Avatar>
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {user.fullName || '—'}
            </Typography.Title>
            <div className="mt-1 flex flex-wrap gap-3 text-gray-500">
              {user.email && (
                <span className="flex items-center gap-1">
                  <MailOutlined /> {user.email}
                </span>
              )}
              {user.phoneNumber && (
                <span className="flex items-center gap-1">
                  <PhoneOutlined /> {user.phoneNumber}
                </span>
              )}
            </div>
            <div className="mt-2 flex gap-2">
              <Tag color={user.type === 'guest' ? 'default' : 'blue'}>
                {user.type === 'guest' ? t('users.guest') : t('users.registered')}
              </Tag>
              {user.newsletterSubscribed && (
                <Tag color="green">{t('users.subscribedToNewsletter')}</Tag>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
