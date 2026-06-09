"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsPatternCard,
  TabsTrigger,
} from "./tabs.shared";

function TabsVertical() {
  return (
    <TabsPatternCard
      title="Vertical"
      description="Vertical tabs work well in settings sidebars and preference screens."
    >
      <Tabs defaultValue="profile" orientation="vertical">
        <TabsList className="w-48">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <div className="flex-1 rounded-lg border p-4 text-sm">
          <TabsContent value="profile">Content for Profile</TabsContent>
          <TabsContent value="security">Content for Security</TabsContent>
          <TabsContent value="notifications">
            Content for Notifications
          </TabsContent>
        </div>
      </Tabs>
    </TabsPatternCard>
  );
}

export { TabsVertical };
