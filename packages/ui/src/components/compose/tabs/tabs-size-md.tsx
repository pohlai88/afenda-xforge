"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsPatternCard,
  TabsTrigger,
} from "./tabs.shared";

function TabsSizeMd() {
  return (
    <TabsPatternCard
      title="Size - Medium"
      description="Medium is the balanced default size for most layouts."
    >
      <Tabs defaultValue="profile" size="md">
        <TabsList size="md">
          <TabsTrigger size="md" value="profile">
            Profile
          </TabsTrigger>
          <TabsTrigger size="md" value="security">
            Security
          </TabsTrigger>
          <TabsTrigger size="md" value="notifications">
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

export { TabsSizeMd };
