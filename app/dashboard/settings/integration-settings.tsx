"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Github, Twitter, Slack, ChromeIcon as Google, Link2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

// Mock integrations data
const mockIntegrations = {
  github: {
    connected: true,
    username: "jameswatson",
    lastSync: "2023-09-15T10:30:00Z",
  },
  google: {
    connected: true,
    email: "user@example.com",
    lastSync: "2023-09-10T14:20:00Z",
  },
  slack: {
    connected: false,
  },
  twitter: {
    connected: false,
  },
}

export function IntegrationSettings() {
  const [integrations, setIntegrations] = useState(mockIntegrations)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const handleConnect = (service: keyof typeof integrations) => {
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      if (integrations[service].connected) {
        // Disconnect
        setIntegrations({
          ...integrations,
          [service]: {
            ...integrations[service],
            connected: false,
          },
        })
        setSuccess(`Desconectado de ${service} com sucesso`)
      } else {
        // Connect
        setIntegrations({
          ...integrations,
          [service]: {
            connected: true,
            username: service === "github" ? "jameswatson" : undefined,
            email: service === "google" ? "user@example.com" : undefined,
            lastSync: new Date().toISOString(),
          },
        })
        setSuccess(`Conectado a ${service} com sucesso`)
      }
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {success && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-600 dark:text-green-400">{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Integrações</CardTitle>
          <CardDescription>Conecte sua conta a outros serviços para melhorar sua experiência.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <Github className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">GitHub</p>
                <p className="text-xs text-muted-foreground">
                  {integrations.github.connected ? `Conectado como ${integrations.github.username}` : "Não conectado"}
                </p>
              </div>
            </div>
            <Button
              variant={integrations.github.connected ? "outline" : "default"}
              size="sm"
              onClick={() => handleConnect("github")}
              disabled={loading}
            >
              {integrations.github.connected ? "Desconectar" : "Conectar"}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <Google className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Google</p>
                <p className="text-xs text-muted-foreground">
                  {integrations.google.connected ? `Conectado como ${integrations.google.email}` : "Não conectado"}
                </p>
              </div>
            </div>
            <Button
              variant={integrations.google.connected ? "outline" : "default"}
              size="sm"
              onClick={() => handleConnect("google")}
              disabled={loading}
            >
              {integrations.google.connected ? "Desconectar" : "Conectar"}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <Slack className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Slack</p>
                <p className="text-xs text-muted-foreground">
                  {integrations.slack.connected ? "Conectado" : "Não conectado"}
                </p>
              </div>
            </div>
            <Button
              variant={integrations.slack.connected ? "outline" : "default"}
              size="sm"
              onClick={() => handleConnect("slack")}
              disabled={loading}
            >
              {integrations.slack.connected ? "Desconectar" : "Conectar"}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <Twitter className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Twitter</p>
                <p className="text-xs text-muted-foreground">
                  {integrations.twitter.connected ? "Conectado" : "Não conectado"}
                </p>
              </div>
            </div>
            <Button
              variant={integrations.twitter.connected ? "outline" : "default"}
              size="sm"
              onClick={() => handleConnect("twitter")}
              disabled={loading}
            >
              {integrations.twitter.connected ? "Desconectar" : "Conectar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      
    </div>
  )
}

