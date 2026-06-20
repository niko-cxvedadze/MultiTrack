import { useEffect, useMemo, useState } from 'react'

import { Input, Select, Space, Table } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { usePageHeader, useUsers } from '@/hooks'
import { adminRoutes } from '@/routes'

import type { User } from '@repo/types'

import { getUserColumns } from './userColumns'

type UserTypeFilter = 'all' | 'registered' | 'guest'

const PAGE_SIZE_OPTIONS = [20, 50, 100]

export function Users() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setHeader } = usePageHeader()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<UserTypeFilter>('registered')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const offset = (page - 1) * pageSize
  const { users, total, isLoading } = useUsers(pageSize, offset)

  useEffect(() => {
    setHeader(t('users.title'))
  }, [t, setHeader])

  const filteredUsers = useMemo(() => {
    let result = users

    if (typeFilter === 'registered') {
      result = result.filter((u) => u.type !== 'guest')
    } else if (typeFilter === 'guest') {
      result = result.filter((u) => u.type === 'guest')
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phoneNumber?.includes(q)
      )
    }

    return result
  }, [users, search, typeFilter])

  const columns = getUserColumns({ t })

  const handlePaginationChange = (newPage: number, newPageSize: number) => {
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize)
      setPage(1)
    } else {
      setPage(newPage)
    }
  }

  return (
    <div>
      <Space className="mb-4" wrap>
        <Select
          value={typeFilter}
          onChange={(value) => {
            setTypeFilter(value)
            setPage(1)
          }}
          style={{ minWidth: 160 }}
          options={[
            { value: 'all', label: t('users.allUsers') },
            { value: 'registered', label: t('users.registered') },
            { value: 'guest', label: t('users.guest') },
          ]}
        />
        <Input.Search
          placeholder={t('users.searchPlaceholder')}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          allowClear
          style={{ width: 360 }}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={filteredUsers as User[]}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          onChange: handlePaginationChange,
        }}
        locale={{ emptyText: t('users.empty') }}
        onRow={(record) => ({
          onClick: () => navigate(adminRoutes.userDetail(record.id)),
          style: { cursor: 'pointer' },
        })}
      />
    </div>
  )
}
