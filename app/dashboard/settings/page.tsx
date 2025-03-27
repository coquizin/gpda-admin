import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccountSettings } from "./account-settings"
import { SecuritySettings } from "./security-settings"
import { IntegrationSettings } from "./integration-settings"
import { getUserProfile } from "@/lib/auth"


export default async function SettingsPage() {
  const profile = await getUserProfile()

  if (!profile) {
    return null
  }

  return (
    <div className="flex flex-col items-center px-4 lg:px-6 py-6">
      <div className="space-y-6 w-full max-w-3xl mx-auto">
        <div className="flex flex-col justify-start gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">Gerencie suas configurações de conta e preferências.</p>
        </div>

        <Tabs defaultValue="account" className="max-w-4xl">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="account">Conta</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="integrations">Integrações</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <AccountSettings profile={profile} />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecuritySettings profile={profile} />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <IntegrationSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

