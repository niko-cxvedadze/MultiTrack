import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App as AntApp, ConfigProvider, theme } from 'antd'

import { NotificationProvider } from './NotificationProvider'

const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: '#4f46e5',
            borderRadius: 6
          }
        }}
      >
        <AntApp>
          <NotificationProvider>{children}</NotificationProvider>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  )
}
