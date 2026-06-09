"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsPatternCard,
  TabsTrigger,
} from "./tabs.shared";

function TabsSizeXs() {
  return (
    <TabsPatternCard
      title="Size - Xsmall"
      description="Xsmall tabs are useful when the navigation must stay compact."
    >
      <Tabs defaultValue="profile" size="xs">
        <TabsList size="xs">
          <TabsTrigger size="xs" value="profile">
            Profile
          </TabsTrigger>
          <TabsTrigger size="xs" value="security">
            Security
          </TabsTrigger>
          <TabsTrigger size="xs" value="notifications">
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

export { TabsSizeXs };
