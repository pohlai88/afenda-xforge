"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsPatternCard,
  TabsTrigger,
} from "./tabs.shared";

function TabsLine() {
  return (
    <TabsPatternCard
      title="Line"
      description="A line treatment emphasizes the active tab with an underline."
    >
      <Tabs defaultValue="profile" variant="line">
        <TabsList variant="line">
          <TabsTrigger value="profile" variant="line">
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" variant="line">
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" variant="line">
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

export { TabsLine };
