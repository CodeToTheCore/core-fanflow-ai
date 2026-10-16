// Demo mode for the public portfolio demo. Turn on with VITE_DEMO_MODE=true.
// See DEMO_MODE.md in the project root.
import api from './api'
import { useArtistStore } from '../store/ArtistStore'

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

// Gets a short-lived login for the shared sample artist from the backend
export async function startDemoSession() {
  const { data } = await api.post('/demo/session')
  useArtistStore.getState().setArtist(data.artist, data.token)
  return data
}
