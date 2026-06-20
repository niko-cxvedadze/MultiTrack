import { MailOutlined, PhoneOutlined } from '@ant-design/icons'
import type { User } from '@repo/types'
import { Avatar, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { TFunction } from 'i18next'

interface UserColumnsParams {
  t: TFunction
}

export function getUserColumns({ t }: UserColumnsParams): ColumnsType<User> {
  return [
    {
      title: '',
      key: 'avatar',
      width: 50,
      render: (_, record) => {
        const initials = record.fullName
          ?.split(' ')
          .map((n) => n.charAt(0))
          .join('')
          .toUpperCase()
          .slice(0, 2)

        return (
          <Avatar size={36} style={{ backgroundColor: '#5B5FC7', fontSize: 14 }}>
            {initials || '?'}
          </Avatar>
        )
      }
    },
    {
      title: t('users.fullName'),
      key: 'fullName',
      render: (_, record) => (
        <Typography.Text className="font-medium">
          {record.fullName || <span className="text-gray-400">—</span>}
        </Typography.Text>
      )
    },
    {
      title: t('users.email'),
      key: 'email',
      render: (_, record) =>
        record.email ? (
          <span className="flex items-center gap-1.5">
            <MailOutlined className="text-gray-400" />
            {record.email}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        )
    },
    {
      title: t('users.phone'),
      key: 'phoneNumber',
      render: (_, record) =>
        record.phoneNumber ? (
          <span className="flex items-center gap-1.5">
            <PhoneOutlined className="text-gray-400" />
            {record.phoneNumber}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        )
    },
    {
      title: t('users.newsletter'),
      key: 'newsletterSubscribed',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <Tag color={record.newsletterSubscribed ? 'green' : 'default'}>
          {record.newsletterSubscribed ? t('common.yes') : t('common.no')}
        </Tag>
      )
    }
  ]
}
