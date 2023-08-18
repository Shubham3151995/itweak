import { check, RESULTS, request, PERMISSIONS } from 'react-native-permissions';
import { Linking, Platform, PermissionsAndroid } from 'react-native';
import { showAlert } from './AlertHelper';
import { Log } from './Logger';

export const PERMISSION_DENIED = -1;
export const PERMISSION_SUCCESS = 1;
export const PERMISSION_BLOCKED = 0;

export const requestPermission = async (permission:any) => {
  let result = await request(permission);
  if (result) {
    Log(result);
  } else Log('error');
};

export const checkPermission = (permission:any, text: string): Promise<number> => {
  return new Promise(async (resolve, reject) => {
    const result = await check(permission);
    Log(result, "permission")
    switch (result) {
      case RESULTS.UNAVAILABLE:
        const alertRes = await showAlert(
          text,
          'Alert',
          true,
          'Open Settings',
        );
        if (alertRes) Linking.openSettings();
        break;

      case RESULTS.DENIED:
        const permRes = await request(permission)
        if (permRes == "granted")
          resolve(1)
        break;

      case RESULTS.GRANTED:
        resolve(1);
        break;
      case RESULTS.BLOCKED:
        const res = await showAlert(
          text,
          'Alert',
          true,
          'Open Settings',
        );
        Log('blocked');
        if (res) Linking.openSettings();
        break;
    }
  });
};

export const LOCATION_PERMISSION = {
  android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
};

// export const hasLocationPermission = async (): Promise<boolean> => {
//   let result = await check(Platform.select(LOCATION_PERMISSION));
//   if (Platform.OS === 'android' && result === RESULTS.DENIED) {
//     await requestPermission(Platform.select(LOCATION_PERMISSION))
//     result = await check(Platform.select(LOCATION_PERMISSION));
//   }
//   if (result === RESULTS.GRANTED) {
//     return true;
//   } else if (result === RESULTS.DENIED) {
//     return false;
//   } else if (result === RESULTS.BLOCKED) {
//     return false;
//   } else {
//     return false;
//   }
// };
