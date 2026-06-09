"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsPatternCard,
  TabsTrigger,
} from "./tabs.shared";

function TabsPill() {
  return (
    <TabsPatternCard
      title="Pill"
      description="Pill-style tabs create a softer segmented-control look."
    >
      <Tabs defaultValue="profile" variant="pill">
        <TabsList variant="pill">
          <TabsTrigger value="profile" variant="pill">
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" variant="pill">
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" variant="pill">
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

export { TabsPill };
