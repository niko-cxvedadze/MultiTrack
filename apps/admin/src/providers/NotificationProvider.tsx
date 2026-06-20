import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

import { notification } from 'antd'
import type { NotificationInstance } from 'antd/es/notification/interface'

const NotificationContext = createContext<NotificationInstance | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [api, contextHolder] = notification.useNotification({
    placement: 'bottomRight',
    duration: 3
  })

  return (
    <NotificationContext.Provider value={api}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const api = useContext(NotificationContext)
  if (!api) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return api
}
