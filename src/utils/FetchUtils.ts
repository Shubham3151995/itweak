import { checkResponse } from './HandleResponse';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import config from './Config';
import Config from './Config';
import { Log } from './Logger';

export const executePostRequest = async (
  endpoint: string,
  paramsObject: Object,
  token?: string,
  isUrlEncoded = false,
) => {
  try {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return {
        code: 400,
        response: {
          messages: [config.error.error_internet_connection],
        },
      };
    }

    const res: any = await fetch(`${config.server.BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: getAPIHeader(token, isUrlEncoded),
      body: paramsObject,
    });

    checkResponse(res);
    const response = await res.json();
    if (res.status != 200) {
      return {
        code: res.status,
        error: response,
      };
    }

    return {
      code: res.status,
      response: response,
    };
  } catch (error) {
    return {
      code: 400,
      error: error + '',
    };
  }
};

export const executeGetRequest = async (endpoint: string, token?: string) => {
  try {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return {
        code: 400,
        response: {
          messages: [config.error.error_internet_connection],
        },
      };
    }
    const res = await fetch(`${config.server.BASE_URL}/${endpoint}`, {
      method: 'GET',
      headers: getAPIHeader(token),
    });
    checkResponse(res);
    const response = await res.json();
    if (res.status != 200) {
      return {
        code: res.status,
        error: response,
      };
    }

    return {
      code: res.status,
      response: response,
    };
  } catch (err) {
    return {
      code: 400,
      error: err + '',
    };
  }
};

export const executeDeleteRequest = async (
  endpoint: string,
  token?: string,
  isUrlEncoded = false,
) => {
  try {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return {
        code: 400,
        response: {
          messages: [config.error.error_internet_connection],
        },
      };
    }

    const res = await fetch(`${config.server.BASE_URL}/${endpoint}`, {
      method: 'DELETE',
      headers: getAPIHeader(token, isUrlEncoded),
      // body: paramsObject,
    });

    checkResponse(res);
    const response = await res.json();
    if (res.status != 200) {
      return {
        code: res.status,
        error: res.text(),
      };
    }
    // const response = await res.json();
    return {
      code: res.status,
      response: response,
    };
  } catch (error) {
    return {
      code: 400,
      error: error + '',
    };
  }
};
export const executePutRequest = async (
  endpoint: string,
  paramsObject: Object,
  token?: string,
  isUrlEncoded = false,
) => {
  try {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return {
        code: 400,
        response: {
          messages: [config.error.error_internet_connection],
        },
      };
    }

    const res = await fetch(`${config.server.BASE_URL}/${endpoint}`, {
      method: 'PUT',
      headers: getAPIHeader(token, isUrlEncoded),
      body: paramsObject,
    });
    checkResponse(res);
    const response = await res.json();
    if (res.status != 200) {
      return {
        code: res.status,
        error: response,
      };
    }

    return {
      code: res.status,
      response: response,
    };
  } catch (error) {
    return {
      code: 400,
      error: error + '',
    };
  }
};

const getAPIHeader = (token?: string, isUrlEncoded?: boolean) => {
  return token ? {
    "Content-Type": "application/json",
    "authorization": 'Bearer ' + token
  } : {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
};

const encodeParamsObject = (paramsObject: any) => {
  let formBody = [];
  for (var property in paramsObject) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(paramsObject[property]);
    formBody.push(encodedKey + '=' + encodedValue);
  }
  return formBody.join('&');
};


