import { useState, useEffect } from 'react'
import type { DreamData } from '../types/dream'
import { getAssetPath } from '../utils/assetPath'

export const useDreamData = () => {
  const [data, setData] = useState<DreamData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const response = await fetch(getAssetPath('/data/dreamData.json'))
        
        if (!response.ok) {
          throw new Error(`Failed to load dream data: ${response.statusText}`)
        }
        
        const jsonData = await response.json()
        setData(jsonData)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
        console.error('Error loading dream data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return { data, loading, error }
}
