"use client";

import { Bell, LockKeyhole, User } from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsPatternCard,
  TabsTrigger,
} from "./tabs.shared";

function TabsIcon() {
  return (
    <TabsPatternCard
      title="Icon"
      description="Icons add quick visual cues to the tab labels."
    >
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">
            <User />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <LockKeyhole />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell />
            Notifications
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile">Content for Profile</TabsContent>
        <TabsContent value="security">Content for Security</TabsContent>
        <TabsContent value="notifications">
          Content for Notifications
        </TabsContent>
      </Tabs>
    </TabsPatternCard>
  );
}

export { TabsIcon };
