import { useContext } from 'react'
import { AppContext } from '../App'

export function useSession() {
  return useContext(AppContext)
}
