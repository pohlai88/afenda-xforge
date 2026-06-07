import type { NotificationDispatchRequest } from "./shared/types.ts";

export type NotificationPriority = "action" | "info" | "success" | "warning";

export type NotificationTemplatePayload = {
  readonly actionUrl?: string;
  readonly body?: string;
  readonly priority: NotificationPriority;
  readonly title: string;
};

export type NotificationTemplate<TInput> = {
  readonly build: (input: TInput) => NotificationTemplatePayload;
  readonly event: string;
};

export const defineNotificationTemplate = <TInput>(
  template: NotificationTemplate<TInput>
): NotificationTemplate<TInput> => template;

export const createNotificationDispatchRequest = <TInput>({
  input,
  notificationId,
  recipients,
  template,
}: {
  readonly input: TInput;
  readonly notificationId?: string;
  readonly recipients: NotificationDispatchRequest<NotificationTemplatePayload>["recipients"];
  readonly template: NotificationTemplate<TInput>;
}): NotificationDispatchRequest<NotificationTemplatePayload> => ({
  event: template.event,
  notificationId,
  payload: template.build(input),
  recipients,
});
