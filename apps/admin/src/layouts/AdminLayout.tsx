import { useState } from 'react'

import {
  DashboardOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons'
import { Avatar, Button, Dropdown, Layout, Menu, Typography, theme } from 'antd'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation, useNavigate } from 'react-router'

import { useLogout, usePageHeader } from '@/hooks'
import { adminRoutes } from '@/routes'

const { Header, Sider, Content } = Layout

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useLogout()
  const { t } = useTranslation()
  const { title, extra } = usePageHeader()
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken()

  const menuItems = [
    {
      key: adminRoutes.dashboard(),
      icon: <DashboardOutlined />,
      label: t('dashboard.title')
    },
    {
      key: adminRoutes.users(),
      icon: <TeamOutlined />,
      label: t('users.title')
    }
  ]

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: () => {
        logout()
        navigate(adminRoutes.login(), { replace: true })
      }
    }
  ]

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        style={{
          borderRight: '1px solid #f0f0f0',
          position: 'sticky',
          top: 0,
          left: 0,
          height: '100vh',
          overflow: 'auto'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="flex h-16 items-center justify-center border-b border-gray-100">
            <Typography.Title level={4} style={{ margin: 0 }}>
              {collapsed ? 'M' : 'MultiTrack'}
            </Typography.Title>
          </div>
          <div style={{ flex: 1 }}>
            <Menu
              mode="inline"
              selectedKeys={[
                menuItems.find(
                  (item) =>
                    item.key === location.pathname ||
                    (item.key !== '/' && location.pathname.startsWith(item.key))
                )?.key || '/'
              ]}
              items={menuItems}
              onClick={({ key }) => navigate(key)}
              style={{ borderInlineEnd: 'none' }}
            />
          </div>
          <div className="border-t border-gray-100 p-3">
            <Dropdown menu={{ items: userMenuItems }} placement="topRight" trigger={['click']}>
              <div className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-colors hover:bg-gray-100">
                <Avatar size="small" icon={<UserOutlined />} />
                {!collapsed && <span className="text-sm">Admin</span>}
              </div>
            </Dropdown>
          </div>
        </div>
      </Sider>

      <Layout>
        <Header
          style={{ background: colorBgContainer, padding: '0 16px' }}
          className="flex items-center justify-between border-b border-gray-100"
        >
          <div className="flex items-center gap-2">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
            {title && (
              <Typography.Title level={4} style={{ margin: 0 }}>
                {title}
              </Typography.Title>
            )}
          </div>
          {extra && <div className="flex items-center gap-2">{extra}</div>}
        </Header>

        <Content
          style={{
            margin: 24,
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            flex: 1
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
