import { useState, useEffect, useRef } from 'react'
import type { Item } from '../types'
import { searchItems } from '../services/mockApi'

export interface UseSearchReturn {
  query: string
  setQuery: (q: string) => void
  results: Item[]
  isLoading: boolean
  error: string | null
}

export function useSearch(): UseSearchReturn {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Incremented on every new search so stale responses can be discarded.
  const requestIdRef = useRef(0)

  useEffect(() => {
    // Schedule the debounced search after 300 ms of inactivity.
    const timerId = setTimeout(() => {
      const currentId = ++requestIdRef.current

      setIsLoading(true)
      setError(null)

      searchItems(query)
        .then(res => {
          // Discard results that arrived out-of-order.
          if (currentId !== requestIdRef.current) return

          setResults(res)
          setIsLoading(false)
        })
        .catch((err: unknown) => {
          if (currentId !== requestIdRef.current) return

          setError(err instanceof Error ? err.message : 'Something went wrong')
          setIsLoading(false)
        })
    }, 300)

    // Cancel the pending timer when the query changes or the hook unmounts.
    return () => clearTimeout(timerId)
  }, [query])

  return { query, setQuery, results, isLoading, error }
}
