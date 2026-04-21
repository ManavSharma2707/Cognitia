import { useCallback, useEffect, useState } from 'react'

/**
 * useApi(apiFn, deps)
 * - Calls apiFn on mount and whenever deps change.
 * - Tracks { data, loading, error } and exposes refetch().
 */
export function useApi(apiFn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await apiFn()
      setData(result)
      return result
    } catch (err) {
      const message = err?.response?.data?.detail ?? err?.message ?? 'Unknown error'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiFn])

  useEffect(() => {
    refetch().catch(() => null)
  }, [refetch, ...deps])

  return { data, loading, error, refetch }
}
