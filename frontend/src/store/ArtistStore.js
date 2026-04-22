import { create } from 'zustand'
import { persist } from 'zustand/middleware'
 
export const useArtistStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      artist: null,
      token: null,
      notifications: [],
 
      setArtist: (artist, token) =>
        set({ artist, token, isAuthenticated: true }),
 
      logout: () =>
        set({ artist: null, token: null, isAuthenticated: false }),
 
      updateArtist: (updates) =>
        set((state) => ({ artist: { ...state.artist, ...updates } })),
 
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            { id: Date.now(), ...notification, read: false },
            ...state.notifications,
          ].slice(0, 50),
        })),
 
      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
 
      unreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    { name: 'fanflow-artist' }
  )
)
 
export const useNotificationStore = create((set) => ({
  notifications: [],
  add: (msg, type = 'info') =>
    set((s) => ({
      notifications: [
        { id: Date.now(), msg, type, time: new Date() },
        ...s.notifications,
      ].slice(0, 20),
    })),
  clear: () => set({ notifications: [] }),
}))
 