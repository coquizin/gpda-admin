"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Shield, ShieldCheck } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/app/utils/supabase/client"
import { User } from "@/entities"

// Mock security settings
const mockSecurity = {
  twoFactorEnabled: false,
  sessionTimeout: 30,
  lastPasswordChange: "2023-08-15T10:30:00Z",
  activeSessions: [
    {
      id: "session-1",
      device: "Chrome em Windows",
      location: "São Paulo, Brasil",
      lastActive: "2023-09-20T14:30:00Z",
      current: true,
    },
    {
      id: "session-2",
      device: "Safari em iPhone",
      location: "Rio de Janeiro, Brasil",
      lastActive: "2023-09-18T09:15:00Z",
      current: false,
    },
  ],
}

export function SecuritySettings({profile}: {profile: User}) {
  const supabase = createClient()
  const [security, setSecurity] = useState(mockSecurity)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem")
      setLoading(false)
      return
    }

    const { data, error } = await supabase.rpc("update_password", {
      current_id: profile.id,
      current_plain_password: currentPassword,
      new_plain_password: newPassword
    });
    
    if (error) {
      // There was an actual error in the call.
      setError("Erro ao alterar senha")
      setLoading(false)
    }

    if (data === "success") {
      setSuccess("Senha alterada com sucesso")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setLoading(false)
    } else if (data === "incorrect") {
      setError("Senha atual incorreta")
      setLoading(false)
    }
  }

  const handleToggleTwoFactor = (checked: boolean) => {
    setSecurity({
      ...security,
      twoFactorEnabled: checked,
    })

    // Show success message
    setSuccess(checked ? "Autenticação de dois fatores ativada com sucesso" : "Autenticação de dois fatores desativada")
  }

  const handleRevokeSession = (sessionId: string) => {
    setSecurity({
      ...security,
      activeSessions: security.activeSessions.filter((session) => session.id !== sessionId),
    })

    setSuccess("Sessão encerrada com sucesso")
  }

  return (
    <div className="space-y-6">
      {success && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-600 dark:text-green-400">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>Atualize sua senha para manter sua conta segura.</CardDescription>
        </CardHeader>
        <form onSubmit={handleChangePassword}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="text-xs text-muted-foreground">
              <p>Última alteração de senha: {new Date(security.lastPasswordChange).toLocaleDateString()}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Alterando..." : "Alterar Senha"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            <span>Autenticação de Dois Fatores</span>
          </CardTitle>
          <CardDescription>Adicione uma camada extra de segurança à sua conta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor">Ativar Autenticação de Dois Fatores</Label>
              <p className="text-sm text-muted-foreground">
                Receba um código de verificação no seu dispositivo ao fazer login.
              </p>
            </div>
            <Switch id="two-factor" checked={security.twoFactorEnabled} onCheckedChange={handleToggleTwoFactor} />
          </div>

          {security.twoFactorEnabled && (
            <div className="rounded-md bg-muted p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium">Autenticação de dois fatores está ativa</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Sua conta está protegida com autenticação de dois fatores.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sessões Ativas</CardTitle>
          <CardDescription>Gerencie os dispositivos conectados à sua conta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {security.activeSessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div className="space-y-1">
                <p className="font-medium">{session.device}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{session.location}</span>
                  <span>•</span>
                  <span>Ativo: {new Date(session.lastActive).toLocaleDateString()}</span>
                  {session.current && (
                    <>
                      <span>•</span>
                      <span className="text-green-600 font-medium">Sessão Atual</span>
                    </>
                  )}
                </div>
              </div>
              {!session.current && (
                <Button variant="outline" size="sm" onClick={() => handleRevokeSession(session.id)}>
                  Encerrar
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

