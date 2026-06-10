export const leaveAttendanceManagementReadPermission = {
  module: "hr",
  object: "leave-attendance",
  function: "read",
} as const;

export const leaveAttendanceManagementWritePermission = {
  module: "hr",
  object: "leave-attendance",
  function: "write",
} as const;

export const leaveAttendanceManagementSensitiveReadPermission = {
  module: "hr",
  object: "leave-attendance",
  function: "sensitive.read",
} as const;

export const hrTimeLamReadPermission: typeof leaveAttendanceManagementReadPermission =
  leaveAttendanceManagementReadPermission;

export const hrTimeLamWritePermission: typeof leaveAttendanceManagementWritePermission =
  leaveAttendanceManagementWritePermission;

export const hrTimeLamAttendanceReadPermission = {
  module: "hr",
  object: "attendance",
  function: "read",
} as const;

export const hrTimeLamAttendanceWritePermission = {
  module: "hr",
  object: "attendance",
  function: "update",
} as const;
