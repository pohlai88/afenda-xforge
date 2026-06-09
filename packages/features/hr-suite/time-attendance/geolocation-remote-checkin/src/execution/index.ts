import {
  createGeolocationRemoteCheckin,
  getGeolocationRemoteCheckin,
  listGeolocationRemoteCheckin,
  updateGeolocationRemoteCheckin,
} from "../server.ts";

export type GeolocationRemoteCheckinExecutionSurface = {
  create: typeof createGeolocationRemoteCheckin;
  getById: typeof getGeolocationRemoteCheckin;
  list: typeof listGeolocationRemoteCheckin;
  update: typeof updateGeolocationRemoteCheckin;
};

export const geolocationRemoteCheckinExecutionSurface: GeolocationRemoteCheckinExecutionSurface =
  {
    create: createGeolocationRemoteCheckin,
    getById: getGeolocationRemoteCheckin,
    list: listGeolocationRemoteCheckin,
    update: updateGeolocationRemoteCheckin,
  };
