import {
  User,
  UserInsert,
  UserUpdate,
  Team,
  TeamInsert,
  TeamUpdate,
  UserTeam,
  UserTeamInsert,
  UserTeamUpdate,
  Squad,
  SquadInsert,
  SquadUpdate,
  UserSquad,
  UserSquadInsert,
  UserSquadUpdate,
  News,
  NewsInsert,
  NewsUpdate,
  Project,
  ProjectInsert,
  ProjectUpdate,
  Invitation,
  InvitationInsert,
  InvitationUpdate
} from '../entities'

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: UserInsert
        Update: UserUpdate
      }
      teams: {
        Row: Team
        Insert: TeamInsert
        Update: TeamUpdate
      }
      user_teams: {
        Row: UserTeam
        Insert: UserTeamInsert
        Update: UserTeamUpdate
      }
      squads: {
        Row: Squad
        Insert: SquadInsert
        Update: SquadUpdate
      }
      user_squads: {
        Row: UserSquad
        Insert: UserSquadInsert
        Update: UserSquadUpdate
      }
      news: {
        Row: News
        Insert: NewsInsert
        Update: NewsUpdate
      }
      projects: {
        Row: Project
        Insert: ProjectInsert
        Update: ProjectUpdate
      }
      invitations: {
        Row: Invitation
        Insert: InvitationInsert
        Update: InvitationUpdate
      }
    }
  }
}

