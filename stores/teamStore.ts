// stores/teamStore.ts
import { Team } from '@/entities'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'


type TeamStore = {
  selectedTeam: Team | null
  setSelectedTeam: (team: Team) => void
  clearSelectedTeam: () => void
}

export const useTeamStore = create<TeamStore>()(
  persist(
    (set) => ({
      selectedTeam: null,
      setSelectedTeam: (team) => set({ selectedTeam: team }),
      clearSelectedTeam: () => set({ selectedTeam: null }),
    }),
    {
      name: 'selected-team', // chave no localStorage
    }
  )
)
