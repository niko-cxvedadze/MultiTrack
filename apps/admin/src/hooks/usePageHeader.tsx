import { atom, useAtom } from 'jotai'
import { useCallback, type ReactNode } from 'react'

interface PageHeaderState {
  title: ReactNode
  extra: ReactNode
}

const pageHeaderAtom = atom<PageHeaderState>({ title: null, extra: null })

export function usePageHeader() {
  const [state, setState] = useAtom(pageHeaderAtom)

  const setHeader = useCallback(
    (title: ReactNode, extra?: ReactNode) => {
      setState({ title, extra: extra ?? null })
    },
    [setState]
  )

  return { title: state.title, extra: state.extra, setHeader }
}
