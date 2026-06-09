"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsPatternCard,
  TabsTrigger,
} from "./tabs.shared";

function TabsButton() {
  return (
    <TabsPatternCard
      title="Button"
      description="Tabs can read like grouped buttons when the surface is stronger."
    >
      <Tabs defaultValue="profile" variant="button">
        <TabsList variant="button">
          <TabsTrigger value="profile" variant="button">
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" variant="button">
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" variant="button">
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

export { TabsButton };
