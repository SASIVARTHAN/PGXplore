import { useLocation } from 'react-router-dom'
import { buildFromPath } from '../utils/navigation'

/** Path to use when linking deeper into the app */
export function useReturnPath(override) {
  const location = useLocation()
  return override ?? buildFromPath(location)
}
