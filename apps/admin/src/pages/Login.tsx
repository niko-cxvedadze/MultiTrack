import { useState } from 'react'

import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, Typography } from 'antd'
import { useNavigate } from 'react-router'

import { useLogin } from '@/hooks'
import { useNotification } from '@/providers'
import { adminRoutes } from '@/routes'

export function Login() {
  const [loading, setLoading] = useState(false)
  const login = useLogin()
  const navigate = useNavigate()
  const notification = useNotification()

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true)
    try {
      await login(values.email, values.password)
      notification.success({ message: 'Login successful' })
      navigate(adminRoutes.home(), { replace: true })
    } catch {
      notification.error({ message: 'Invalid email or password' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card
        className="w-full max-w-sm"
        variant="borderless"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
      >
        <div className="mb-6 text-center">
          <Typography.Title level={3} style={{ marginBottom: 4 }}>
            Printa Admin
          </Typography.Title>
          <Typography.Text type="secondary">Sign in to continue</Typography.Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Enter your email' },
              { type: 'email', message: 'Invalid email' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Enter your password' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Sign in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
