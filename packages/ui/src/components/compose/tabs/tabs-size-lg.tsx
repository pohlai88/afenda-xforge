"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsPatternCard,
  TabsTrigger,
} from "./tabs.shared";

function TabsSizeLg() {
  return (
    <TabsPatternCard
      title="Size - Large"
      description="Large tabs give more breathing room for prominent navigation."
    >
      <Tabs defaultValue="profile" size="lg">
        <TabsList size="lg">
          <TabsTrigger size="lg" value="profile">
            Profile
          </TabsTrigger>
          <TabsTrigger size="lg" value="security">
            Security
          </TabsTrigger>
          <TabsTrigger size="lg" value="notifications">
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

export { TabsSizeLg };
