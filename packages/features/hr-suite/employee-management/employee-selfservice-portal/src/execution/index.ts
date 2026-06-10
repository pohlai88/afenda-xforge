import {
  approveEmployeeSelfservicePortalProfileUpdateRequest,
  buildEmployeeSelfservicePortalProfilePageModel,
  createEmployeeSelfservicePortal,
  getEmployeeSelfservicePortal,
  getEmployeeSelfservicePortalProfile,
  getEmployeeSelfservicePortalProfileUpdateRequestView,
  listEmployeeSelfservicePortal,
  listEmployeeSelfservicePortalAuditTrailEvents,
  listEmployeeSelfservicePortalProfileUpdateRequestViews,
  recordEmployeeSelfservicePortalAuditEvent,
  rejectEmployeeSelfservicePortalProfileUpdateRequest,
  submitEmployeeSelfservicePortalProfileUpdateRequest,
  updateEmployeeSelfservicePortal,
} from "../server.ts";

export type EmployeeSelfservicePortalExecutionSurface = {
  approveProfileUpdateRequest: typeof approveEmployeeSelfservicePortalProfileUpdateRequest;
  listAuditTrailEvents: typeof listEmployeeSelfservicePortalAuditTrailEvents;
  buildProfilePageModel: typeof buildEmployeeSelfservicePortalProfilePageModel;
  create: typeof createEmployeeSelfservicePortal;
  getById: typeof getEmployeeSelfservicePortal;
  getProfile: typeof getEmployeeSelfservicePortalProfile;
  getProfileUpdateRequestById: typeof getEmployeeSelfservicePortalProfileUpdateRequestView;
  list: typeof listEmployeeSelfservicePortal;
  listProfileUpdateRequests: typeof listEmployeeSelfservicePortalProfileUpdateRequestViews;
  recordAuditEvent: typeof recordEmployeeSelfservicePortalAuditEvent;
  rejectProfileUpdateRequest: typeof rejectEmployeeSelfservicePortalProfileUpdateRequest;
  submitProfileUpdateRequest: typeof submitEmployeeSelfservicePortalProfileUpdateRequest;
  update: typeof updateEmployeeSelfservicePortal;
};

export const employeeSelfservicePortalExecutionSurface: EmployeeSelfservicePortalExecutionSurface =
  {
    approveProfileUpdateRequest:
      approveEmployeeSelfservicePortalProfileUpdateRequest,
    listAuditTrailEvents: listEmployeeSelfservicePortalAuditTrailEvents,
    buildProfilePageModel: buildEmployeeSelfservicePortalProfilePageModel,
    create: createEmployeeSelfservicePortal,
    getById: getEmployeeSelfservicePortal,
    getProfile: getEmployeeSelfservicePortalProfile,
    getProfileUpdateRequestById:
      getEmployeeSelfservicePortalProfileUpdateRequestView,
    list: listEmployeeSelfservicePortal,
    listProfileUpdateRequests:
      listEmployeeSelfservicePortalProfileUpdateRequestViews,
    recordAuditEvent: recordEmployeeSelfservicePortalAuditEvent,
    rejectProfileUpdateRequest:
      rejectEmployeeSelfservicePortalProfileUpdateRequest,
    submitProfileUpdateRequest:
      submitEmployeeSelfservicePortalProfileUpdateRequest,
    update: updateEmployeeSelfservicePortal,
  };
