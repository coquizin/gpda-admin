"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User } from "@/entities"
import { createClient } from "@/app/utils/supabase/client"
import { useRouter } from "next/navigation"


export function AccountSettings({profile}: {profile: User}) {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState(profile)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { data, error } = await supabase.from("profiles").update({
        name: user.name,
        email: user.email,
      }).eq("id", user.id)

      if (error) {
        throw error
      }

      const { data: updatedUser, error: userError } = await supabase.auth.updateUser({
        email: user.email,
        data: {
          name: user.name,
        }
      })

      if (userError) {
        throw userError
      }

      setSuccess("Suas informações de conta foram atualizadas com sucesso.")
      router.refresh()

    } catch (error) {
      setError("Ocorreu um erro ao atualizar suas informações de conta. Por favor, tente novamente.")
    }
    
    setLoading(false)
  
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações Gerais</CardTitle>
          <CardDescription>Atualize suas informações básicas de conta.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
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

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="language">Idioma</Label>
                <Select value="en-US" onValueChange={(value) => setUser({ ...user})}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Selecione um idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                    <SelectItem value="fr-FR">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Fuso Horário</Label>
                <Select value="America/Sao_Paulo" onValueChange={(value) => setUser({ ...user})}>
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Selecione um fuso horário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                    <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo (GMT+9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Excluir Conta</CardTitle>
          <CardDescription>Excluir sua conta é uma ação permanente e não pode ser desfeita.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Quando você exclui sua conta, todos os seus dados são permanentemente removidos. Isso não pode ser desfeito.
          </p>
        </CardContent>
        <CardFooter>
          <Button disabled variant="destructive">Excluir Conta</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

