"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsPatternCard,
  TabsTrigger,
} from "./tabs.shared";

function TabsSizeSm() {
  return (
    <TabsPatternCard
      title="Size - Small"
      description="Small tabs compress the navigation for denser layouts."
    >
      <Tabs defaultValue="profile" size="sm">
        <TabsList size="sm">
          <TabsTrigger size="sm" value="profile">
            Profile
          </TabsTrigger>
          <TabsTrigger size="sm" value="security">
            Security
          </TabsTrigger>
          <TabsTrigger size="sm" value="notifications">
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

export { TabsSizeSm };
