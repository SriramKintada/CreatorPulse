"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/layout/main-layout"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("users")

  const users = [
    { id: 1, name: "John Doe", email: "john@example.com", status: "Active", plan: "Professional" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", status: "Active", plan: "Starter" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", status: "Inactive", plan: "Professional" },
  ]

  const stats = [
    { label: "Total Users", value: "1,234", change: "+12%" },
    { label: "Active Newsletters", value: "5,678", change: "+23%" },
    { label: "Total Emails Sent", value: "2.3M", change: "+45%" },
    { label: "Avg Open Rate", value: "32.5%", change: "+5%" },
  ]

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-foreground/60">Manage users, content, and system settings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-accent-primary/20 p-6">
              <p className="text-foreground/60 text-sm mb-2">{stat.label}</p>
              <div className="flex justify-between items-end">
                <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                <span className="text-green-500 text-sm font-medium">{stat.change}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-accent-primary/20">
          {["users", "content", "settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium transition-all border-b-2 capitalize ${
                activeTab === tab
                  ? "border-accent-primary text-accent-primary"
                  : "border-transparent text-foreground/60 hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <Card className="border-accent-primary/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-accent-primary/5 border-b border-accent-primary/20">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Plan</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-accent-primary/10 hover:bg-accent-primary/5 transition-colors"
                    >
                      <td className="px-6 py-4 text-foreground font-medium">{user.name}</td>
                      <td className="px-6 py-4 text-foreground/60">{user.email}</td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary">{user.plan}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.status === "Active" ? "default" : "secondary"}>{user.status}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Content Tab */}
        {activeTab === "content" && (
          <Card className="border-accent-primary/20 p-6">
            <div className="space-y-4">
              <div className="p-4 bg-accent-primary/5 rounded-lg border border-accent-primary/20">
                <h3 className="font-medium text-foreground mb-2">Content Moderation</h3>
                <p className="text-sm text-foreground/60 mb-4">Review and manage user-generated content</p>
                <Button className="bg-accent-primary hover:bg-accent-primary/90">Review Pending Content</Button>
              </div>
            </div>
          </Card>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <Card className="border-accent-primary/20 p-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-foreground mb-4">System Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-accent-primary/5 rounded-lg">
                    <span className="text-foreground">Maintenance Mode</span>
                    <input type="checkbox" className="w-5 h-5 cursor-pointer" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-accent-primary/5 rounded-lg">
                    <span className="text-foreground">Email Verification Required</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5 cursor-pointer" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-accent-primary/5 rounded-lg">
                    <span className="text-foreground">Two-Factor Authentication</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5 cursor-pointer" />
                  </div>
                </div>
              </div>

              <Button className="bg-accent-primary hover:bg-accent-primary/90">Save Settings</Button>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
