import {
  approveEmployeeSelfservicePortalProfileUpdateRequest,
  buildEmployeeSelfservicePortalProfilePageModel,
  createEmployeeSelfservicePortal,
  getEmployeeSelfservicePortal,
  getEmployeeSelfservicePortalProfile,
  getEmployeeSelfservicePortalProfileUpdateRequestView,
  listEmployeeSelfservicePortal,
  listEmployeeSelfservicePortalProfileUpdateRequestViews,
  rejectEmployeeSelfservicePortalProfileUpdateRequest,
  submitEmployeeSelfservicePortalProfileUpdateRequest,
  updateEmployeeSelfservicePortal,
} from "../server.ts";

export type EmployeeSelfservicePortalExecutionSurface = {
  approveProfileUpdateRequest: typeof approveEmployeeSelfservicePortalProfileUpdateRequest;
  buildProfilePageModel: typeof buildEmployeeSelfservicePortalProfilePageModel;
  create: typeof createEmployeeSelfservicePortal;
  getById: typeof getEmployeeSelfservicePortal;
  getProfile: typeof getEmployeeSelfservicePortalProfile;
  getProfileUpdateRequestById: typeof getEmployeeSelfservicePortalProfileUpdateRequestView;
  list: typeof listEmployeeSelfservicePortal;
  listProfileUpdateRequests: typeof listEmployeeSelfservicePortalProfileUpdateRequestViews;
  rejectProfileUpdateRequest: typeof rejectEmployeeSelfservicePortalProfileUpdateRequest;
  submitProfileUpdateRequest: typeof submitEmployeeSelfservicePortalProfileUpdateRequest;
  update: typeof updateEmployeeSelfservicePortal;
};

export const employeeSelfservicePortalExecutionSurface: EmployeeSelfservicePortalExecutionSurface =
  {
    approveProfileUpdateRequest:
      approveEmployeeSelfservicePortalProfileUpdateRequest,
    buildProfilePageModel: buildEmployeeSelfservicePortalProfilePageModel,
    create: createEmployeeSelfservicePortal,
    getById: getEmployeeSelfservicePortal,
    getProfile: getEmployeeSelfservicePortalProfile,
    getProfileUpdateRequestById:
      getEmployeeSelfservicePortalProfileUpdateRequestView,
    list: listEmployeeSelfservicePortal,
    listProfileUpdateRequests:
      listEmployeeSelfservicePortalProfileUpdateRequestViews,
    rejectProfileUpdateRequest:
      rejectEmployeeSelfservicePortalProfileUpdateRequest,
    submitProfileUpdateRequest:
      submitEmployeeSelfservicePortalProfileUpdateRequest,
    update: updateEmployeeSelfservicePortal,
  };
