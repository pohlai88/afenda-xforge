"use client";

import { Badge } from "../../ui-shadcn/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsPatternCard,
  TabsTrigger,
} from "./tabs.shared";

function TabsBadge() {
  return (
    <TabsPatternCard
      title="Badge"
      description="Badges can communicate counts or status directly in the tab label."
    >
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">
            Profile
            <Badge size="xs" variant="secondary">
              12
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="security">
            Security
            <Badge size="xs" variant="secondary">
              5
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications
            <Badge size="xs" variant="secondary">
              9
            </Badge>
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

export { TabsBadge };
