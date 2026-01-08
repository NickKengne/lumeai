"use client"

import { NavActions } from "@/components/nav-actions"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  CreditCard, 
  Key, 
  Trash2,
  Camera,
  Save,
  X
} from "lucide-react"
import * as React from "react"
import type { Metadata } from "next"

export default function SettingsPage() {
  const [isSaving, setIsSaving] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("profile")
  
  // Form state
  const [profileData, setProfileData] = React.useState({
    name: "Nick Dibrilain",
    email: "nickdk294@gmail.com",
    avatar: "https://media.licdn.com/dms/image/v2/D4E03AQHTYbBtKMY2Vg/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1714722950547?e=1769040000&v=beta&t=uwYoa3mmJNdHaic0FpADf8r_qPm7CmhWN7jRId4Yxq0"
  })
  
  const [passwordData, setPasswordData] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  
  const [preferences, setPreferences] = React.useState({
    emailNotifications: true,
    marketingEmails: false,
    weeklyDigest: true
  })

  const handleSaveProfile = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    // Show success message
  }

  const handleSavePassword = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
  }

  const handleSavePreferences = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, avatar: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Password", icon: Lock },
    { id: "preferences", label: "Preferences", icon: Bell },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "api", label: "API Keys", icon: Key },
  ]

  return (
    <SidebarInset>
      <header className="flex h-14 shrink-0 items-center gap-2 bg-neutral-50 border-b border-neutral-200">
        <div className="flex flex-1 items-center gap-2 px-3">
          <SidebarTrigger />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1">
                  Settings
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-3">
          <NavActions />
        </div>
      </header>

      <div className="bg-neutral-50 flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="mb-8">
            <h1 className="text-4xl font-light tracking-tight text-neutral-900 mb-2">
              Account Settings
            </h1>
            <p className="text-neutral-500 font-light">
              Manage your account information and preferences
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 border-b border-neutral-200">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-light border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "border-neutral-900 text-neutral-900"
                      : "border-transparent text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-8">
              <div className="border border-neutral-200 bg-neutral-50 p-8">
                <h2 className="text-lg font-light text-neutral-900 mb-6">Profile Information</h2>
                
                <div className="flex items-start gap-8 mb-8">
                  <div className="relative">
                    <Avatar className="size-24">
                      <AvatarImage src={profileData.avatar} alt={profileData.name} />
                      <AvatarFallback className="bg-neutral-200 text-neutral-600 text-2xl">
                        {profileData.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute bottom-0 right-0 p-2 bg-neutral-900 text-white cursor-pointer hover:bg-neutral-800 transition-colors">
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-500 font-light mb-1">Profile Picture</p>
                    <p className="text-xs text-neutral-400 font-light">JPG, PNG or GIF. Max size 2MB</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-sm font-light text-neutral-600 mb-2 block">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-neutral-50 border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-light text-neutral-600 mb-2 block">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-neutral-50 border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="bg-neutral-900 text-white font-light border border-neutral-900 hover:bg-neutral-800"
                    >
                      {isSaving ? (
                        <>
                          <div className="h-4 w-4 animate-spin border-2 border-white border-t-transparent mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="font-light border-neutral-200 hover:bg-neutral-100"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <div className="space-y-8">
              <div className="border border-neutral-200 bg-neutral-50 p-8">
                <h2 className="text-lg font-light text-neutral-900 mb-6">Change Password</h2>
                
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="currentPassword" className="text-sm font-light text-neutral-600 mb-2 block">
                      Current Password
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="bg-neutral-50 border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"
                    />
                  </div>

                  <div>
                    <Label htmlFor="newPassword" className="text-sm font-light text-neutral-600 mb-2 block">
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="bg-neutral-50 border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"
                    />
                    <p className="text-xs text-neutral-400 font-light mt-1">Must be at least 8 characters</p>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-light text-neutral-600 mb-2 block">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="bg-neutral-50 border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSavePassword}
                      disabled={isSaving || !passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                      className="bg-neutral-900 text-white font-light border border-neutral-900 hover:bg-neutral-800 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <div className="h-4 w-4 animate-spin border-2 border-white border-t-transparent mr-2" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Update Password
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })}
                      className="font-light border-neutral-200 hover:bg-neutral-100"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <div className="space-y-8">
              <div className="border border-neutral-200 bg-neutral-50 p-8">
                <h2 className="text-lg font-light text-neutral-900 mb-6">Notification Preferences</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between py-3 border-b border-neutral-200">
                    <div>
                      <p className="text-sm font-light text-neutral-900">Email Notifications</p>
                      <p className="text-xs text-neutral-500 font-light">Receive email updates about your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.emailNotifications}
                        onChange={(e) => setPreferences(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-neutral-900 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-neutral-200">
                    <div>
                      <p className="text-sm font-light text-neutral-900">Marketing Emails</p>
                      <p className="text-xs text-neutral-500 font-light">Receive emails about new features and updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.marketingEmails}
                        onChange={(e) => setPreferences(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-neutral-900 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-light text-neutral-900">Weekly Digest</p>
                      <p className="text-xs text-neutral-500 font-light">Get a weekly summary of your activity</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.weeklyDigest}
                        onChange={(e) => setPreferences(prev => ({ ...prev, weeklyDigest: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-neutral-900 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900"></div>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSavePreferences}
                      disabled={isSaving}
                      className="bg-neutral-900 text-white font-light border border-neutral-900 hover:bg-neutral-800"
                    >
                      {isSaving ? (
                        <>
                          <div className="h-4 w-4 animate-spin border-2 border-white border-t-transparent mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Preferences
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === "billing" && (
            <div className="space-y-8">
              <div className="border border-neutral-200 bg-neutral-50 p-8">
                <h2 className="text-lg font-light text-neutral-900 mb-6">Subscription & Billing</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between py-4 border-b border-neutral-200">
                    <div>
                      <p className="text-sm font-light text-neutral-900">Current Plan</p>
                      <p className="text-xs text-neutral-500 font-light mt-1">Pro Plan - $29/month</p>
                    </div>
                    <Button
                      variant="outline"
                      className="font-light border-neutral-200 hover:bg-neutral-100"
                    >
                      Change Plan
                    </Button>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b border-neutral-200">
                    <div>
                      <p className="text-sm font-light text-neutral-900">Next Billing Date</p>
                      <p className="text-xs text-neutral-500 font-light mt-1">January 15, 2025</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-light text-neutral-900">Payment Method</p>
                      <p className="text-xs text-neutral-500 font-light mt-1">•••• •••• •••• 4242</p>
                    </div>
                    <Button
                      variant="outline"
                      className="font-light border-neutral-200 hover:bg-neutral-100"
                    >
                      Update
                    </Button>
                  </div>

                  <div className="pt-6 border-t border-neutral-200">
                    <Button
                      variant="outline"
                      className="font-light border-neutral-200 hover:bg-neutral-100 text-neutral-600"
                    >
                      View Billing History
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Keys Tab */}
          {activeTab === "api" && (
            <div className="space-y-8">
              <div className="border border-neutral-200 bg-neutral-50 p-8">
                <h2 className="text-lg font-light text-neutral-900 mb-2">API Keys</h2>
                <p className="text-sm text-neutral-500 font-light mb-6">
                  Manage your API keys for programmatic access to Lume AI
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-neutral-200 bg-neutral-50">
                    <div className="flex-1">
                      <p className="text-sm font-light text-neutral-900">Production Key</p>
                      <p className="text-xs text-neutral-500 font-light mt-1 font-mono">
                        lume_sk_live_••••••••••••••••••••••••••••••••
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-light border-neutral-200 hover:bg-neutral-100"
                      >
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-light border-neutral-200 hover:bg-neutral-100"
                      >
                        Regenerate
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-neutral-200 bg-neutral-50">
                    <div className="flex-1">
                      <p className="text-sm font-light text-neutral-900">Test Key</p>
                      <p className="text-xs text-neutral-500 font-light mt-1 font-mono">
                        lume_sk_test_••••••••••••••••••••••••••••••••
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-light border-neutral-200 hover:bg-neutral-100"
                      >
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-light border-neutral-200 hover:bg-neutral-100"
                      >
                        Regenerate
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      variant="outline"
                      className="font-light border-neutral-200 hover:bg-neutral-100"
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Create New API Key
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Danger Zone */}
          <div className="border border-neutral-200 bg-neutral-50 p-8 mt-8">
            <h2 className="text-lg font-light text-neutral-900 mb-2">Danger Zone</h2>
            <p className="text-sm text-neutral-500 font-light mb-6">
              Irreversible and destructive actions
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 border-b border-neutral-200">
                <div>
                  <p className="text-sm font-light text-neutral-900">Delete Account</p>
                  <p className="text-xs text-neutral-500 font-light mt-1">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="font-light border-neutral-200 hover:bg-neutral-100 text-neutral-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}


