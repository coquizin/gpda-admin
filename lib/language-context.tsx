"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "en" | "pt-BR"

type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // General
    dark_mode: "Dark Mode",
    light_mode: "Light Mode",
    language: "Language",
    english: "English",
    portuguese: "Portuguese",
    sign_out: "Sign Out",
    save_changes: "Save Changes",
    cancel: "Cancel",

    // Sidebar
    dashboard: "Dashboard",
    analytics: "Analytics",
    team_profile: "Team Profile",
    news: "News",
    projects: "Projects",
    users: "Users",
    squads: "Squads",
    invitations: "Invitations",
    teams: "Teams",
    settings: "Settings",
    help: "Help",
    overview: "Overview",
    content: "Content",
    management: "Management",
    select_team: "Select Team",
    profile: "Profile",
    account_settings: "Account Settings",
    admin_panel: "Admin Panel",

    // Profile
    profile_title: "Profile",
    profile_description: "Manage your account settings and preferences",
    personal_info: "Personal Information",
    full_name: "Full Name",
    email: "Email",
    role: "Role",
    update_profile: "Update Profile",
    change_password: "Change Password",
    current_password: "Current Password",
    new_password: "New Password",
    confirm_password: "Confirm Password",
    password_requirements: "Password must be at least 8 characters",
    passwords_dont_match: "Passwords don't match",
    preferences: "Preferences",
    theme: "Theme",
    system: "System",
    language_preference: "Language Preference",
  },
  "pt-BR": {
    // General
    dark_mode: "Modo Escuro",
    light_mode: "Modo Claro",
    language: "Idioma",
    english: "Inglês",
    portuguese: "Português",
    sign_out: "Sair",
    save_changes: "Salvar Alterações",
    cancel: "Cancelar",

    // Sidebar
    dashboard: "Painel",
    analytics: "Análises",
    team_profile: "Perfil da Equipe",
    news: "Notícias",
    projects: "Projetos",
    users: "Usuários",
    squads: "Esquadrões",
    invitations: "Convites",
    teams: "Equipes",
    settings: "Configurações",
    help: "Ajuda",
    overview: "Visão Geral",
    content: "Conteúdo",
    management: "Gerenciamento",
    select_team: "Selecionar Equipe",
    profile: "Perfil",
    account_settings: "Configurações da Conta",
    admin_panel: "Painel de Administração",

    // Profile
    profile_title: "Perfil",
    profile_description: "Gerencie suas configurações e preferências de conta",
    personal_info: "Informações Pessoais",
    full_name: "Nome Completo",
    email: "E-mail",
    role: "Função",
    update_profile: "Atualizar Perfil",
    change_password: "Alterar Senha",
    current_password: "Senha Atual",
    new_password: "Nova Senha",
    confirm_password: "Confirmar Senha",
    password_requirements: "A senha deve ter pelo menos 8 caracteres",
    passwords_dont_match: "As senhas não coincidem",
    preferences: "Preferências",
    theme: "Tema",
    system: "Sistema",
    language_preference: "Preferência de Idioma",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    // Load language preference from localStorage on client side
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "pt-BR")) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    localStorage.setItem("language", newLanguage)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

