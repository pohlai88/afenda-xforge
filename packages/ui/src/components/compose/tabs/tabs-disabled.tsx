"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsPatternCard,
  TabsTrigger,
} from "./tabs.shared";

function TabsDisabled() {
  return (
    <TabsPatternCard
      title="Disabled"
      description="Disabled tabs preserve structure while preventing selection."
    >
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger disabled value="security">
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
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

export { TabsDisabled };
