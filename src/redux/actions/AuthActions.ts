import { Dispatch } from 'redux';
import { setLoading } from '../creators/LoadingCreator';
import {
  storeUserDetails,
  setAccessToken,
  clearAll,
  storeContacts,
  storeLanguages,
  storeCategories,
  storeCountries,
  storeEvents,
  storeUser,
  storePlatform,
  storeCurruncy,
  storeFilters,
  storePosts
} from '../creators/AuthCreators';
import { AppActionTypes } from '../types';
import {
  executePostRequest,
  executeGetRequest,
  executePutRequest,
  executeDeleteRequest,
} from '../../utils/FetchUtils';
import {
  contact,
  Editcontact,
  Deletecontact,
  User
} from '../../types/modals/User';
import { RootState } from '../reducers';
import { Platform } from 'react-native';
import { Log } from '../../utils/Logger';
import { showAlert } from '../../utils/AlertHelper'
// import { log } from 'react-native-reanimated';
// import ImageResizer from 'react-native-image-resizer';


/**
 * API for check email already  exist or not 
 * @param data user email address
 * @returns Responce from API
 */
export const EmailVerificationAction = (data: any) => {
  return async (dispatch: Dispatch<AppActionTypes>) => {
    dispatch(setLoading(true));
    let Result: any
    try {
      Result = await executePostRequest(
        'api/emailExists',
        data
      );
      if (Result.code == 200) {
        // dispatch(setAccessToken(Result.response.access_token))

      }
      console.log("resultRegister===>", Result);

      dispatch(setLoading(false));
      return Result

    } catch (error) {
      dispatch(setLoading(false));
      showAlert(error)
      return Result

    }
  };
};

/**
 * API for register new user 
 * @param data user infromation for register
 * @returns Responce from API
 */
export const RegisterAction = (data: any) => {
  console.log("resultRegister===>1111", data);
  return async (dispatch: Dispatch<AppActionTypes>) => {
    dispatch(setLoading(true));
    let Result: any
    try {
      Result = await executePostRequest(
        'register',
        data
      );
      if (Result.code == 200) {
        // dispatch(setAccessToken(Result.response.access_token))

      }
      console.log("resultRegister===>", Result);

      dispatch(setLoading(false));
      return Result

    } catch (error) {
      dispatch(setLoading(false));
      showAlert(error)
      return Result

    }
  };
};


/**
 * API for Verify Email
 * @param data 6 digit code
 * @returns Responce from API
 */
export const VerifyEmailAction = (data: any) => {
  return async (dispatch: Dispatch<AppActionTypes>) => {
    dispatch(setLoading(true));
    let Result: any
    try {
      Result = await executePutRequest(
        'api/verify-email',
        data
      );
      if (Result.code == 200) {
        dispatch(setAccessToken(Result.response.access_token))

      }
      console.log("resultRegister===>", Result);

      dispatch(setLoading(false));
      return Result

    } catch (error) {
      dispatch(setLoading(false));
      showAlert(error)
      return Result

    }
  };
};



/**
 * API for Login
 * @param data user infromation for Login
 * @returns Responce from API
 */
export const LoginAction = (data: any) => {
  return async (dispatch: Dispatch<AppActionTypes>) => {
    dispatch(setLoading(true));
    let Result: any
    try {
      Result = await executePostRequest(
        'login',
        data
      );
      if (Result.code == 200) {
        dispatch(setAccessToken(Result.response.access_token))
      }else{
showAlert(Result.error.message)
      }
      console.log("Login===>", Result);

      dispatch(setLoading(false));
      return Result

    } catch (error) {
      dispatch(setLoading(false));
      
      return Result

    }
  };
};

/**
 * API for get languages
 * @returns Responce from API
 */
export const LanguageAction = () => {

  return async (dispatch: Dispatch<AppActionTypes>) => {
    dispatch(setLoading(true));
    let Result: any
    try {
      Result = await executeGetRequest(
        'api/languages',
      );
      if (Result.code == 200) {
        dispatch(storeLanguages(Result.response))
      }
      console.log("Languages===>", Result);

      dispatch(setLoading(false));
      return Result

    } catch (error) {
      dispatch(setLoading(false));
      showAlert(error)
      return Result

    }
  };
};



/**
 * API for get categories
 * @returns Responce from API
 */
export const CategoriesAction = () => {

  return async (dispatch: Dispatch<AppActionTypes>) => {
    let Result: any
    try {
      Result = await executeGetRequest(
        'api/categories',
      );
      if (Result.code == 200) {
        dispatch(storeCategories(Result.response))
      }
      console.log("Languages===>", Result);

      dispatch(setLoading(false));
      return Result

    } catch (error) {
      dispatch(setLoading(false));
      showAlert(error)
      return Result

    }
  };
};


/**
 * API for get countries
 * @returns Responce from API
 */
export const CountriesAction = () => {

  return async (dispatch: Dispatch<AppActionTypes>) => {
    dispatch(setLoading(true));
    let Result: any
    try {
      Result = await executeGetRequest(
        'api/countries',
      );
      if (Result.code == 200) {
        dispatch(storeCountries(Result.response))
      }
      console.log("Languages===>", Result);

      dispatch(setLoading(false));
      return Result

    } catch (error) {
      dispatch(setLoading(false));
      showAlert(error)
      return Result

    }
  };
};


/**
 * API for get categories
 * @returns Responce from API
 */
export const getEventsAction = (isLOader) => {
  return async (dispatch: Dispatch<AppActionTypes>, getState: () => RootState,) => {
    const token = getState().persistedReducer.token;
    isLOader == true ? dispatch(setLoading(true)) : null
    let Result: any
    try {
      Result = await executeGetRequest(
        'api/events',
        token
      );
      if (Result.code == 200) {
        dispatch(storeEvents(Result.response?.data))
      }
      console.log("Events===>", Result);

      dispatch(setLoading(false));
      return Result

    } catch (error) {
      dispatch(setLoading(false));
      console.log("EventsError===>", error, Result);
      showAlert(error)
      return Result

    }
  };
};
export const getUserProfileAction = () => {
  return async (dispatch: Dispatch<AppActionTypes>, getState: () => RootState,) => {
    const token = getState().persistedReducer.token;
    // dispatch(setLoading(true));
    let Result: any
    try {
      Result = await executeGetRequest(
        'api/user',
        token
      );
      if (Result.code == 200) {
        dispatch(storeUser(Result.response))
      }
      console.log("userInfo===>", Result);

      dispatch(setLoading(false));
      return Result

    } catch (error) {
      console.log("UserInfoError===>", error, Result);
      dispatch(setLoading(false));
      showAlert(error)
      return Result

    }
  };
};

// export const UploadImageAction2 = (data: any, dispatch: Dispatch<AppActionTypes>) => {
//   ImageResizer.createResizedImage(data?.uri, 80, 80, "JPEG", 70, 0, undefined)
//     .then(response => {
//       console.log("getResImage==>", response)

//       // response.uri is the URI of the new image that can now be displayed, uploaded...
//       // response.path is the path of the new image
//       // response.name is the name of the new image with the extension
//       // response.size is the size of the new image

//     })
//     .catch(err => {
//       console.log("error", err);

//       // Oops, something went wrong. Check that the filename is correct and
//       // inspect err to get more details.
//     });

// }


/**
 * API for upload image in server and get url for use in any API
 * @param data Image url
 * @returns Responce from API
 */
export const UploadImageAction = (data: any) => {
  console.log("url ==", data);
  return async (dispatch: Dispatch<AppActionTypes>, getState: () => RootState,) => {
    const token = getState().persistedReducer.token;
    let ImageName = new Date().getTime()
    let formdata = new FormData();
    formdata.append('image', { uri: data, name: ImageName + '.jpg', type: 'image/jpeg/jpg/png' });
    dispatch(setLoading(true));
    let Result: any
    try {
      Result = await executePostRequest(
        'api/image-upload',
        formdata,
        token
      );
      if (Result.code == 200) {
        // dispatch(setAccessToken(Result.response.access_token))

      }
      console.log("image Upload Result===>", Result);

      dispatch(setLoading(false));
      return Result

    } catch (error) {
      console.log("Upload Image URl error", error);

      dispatch(setLoading(false));
      showAlert(error)
      return Result

    }
  };


};


/**
 * API for Verify Email
 * @param data 6 digit code
 * @returns Responce from API
 */
export const EditEmailAction = (data: any) => {
  return async (dispatch: Dispatch<AppActionTypes>, getState: () => RootState,) => {
    const token = getState().persistedReducer.token;
    dispatch(setLoading(true));
    let Result: any
    try {
      Result = await executePutRequest(
        'api/user',
        data,
        token
      );
      if (Result.code == 200) {
        // dispatch(setAccessToken(Result.response.access_token))
      }
      console.log("result Edit profile===>", Result);

      dispatch(setLoading(false));
      return Result

    } catch (error) {
      dispatch(setLoading(false));
      showAlert(error)
      return Result

    }
  };
};


/**
 * API for get Platforms
 * @returns Responce from API
 */
export const getPlatformAction = () => {

  return async (dispatch: Dispatch<AppActionTypes>) => {
    dispatch(setLoading(true));
    let Result: any
    try {
      Result = await executeGetRequest(
        'api/platforms',
      );
      if (Result.code == 200) {
        dispatch(storePlatform(Result.response))
      }
      console.log("Languages===>", Result);

      dispatch(setLoading(false));
      return Result

    } catch (error) {
      dispatch(setLoading(false));
      showAlert(error)
      return Result

    }
  };
};


/**
 * API for get Currency
 * @returns Responce from API
 */
export const getCurruncyAction = () => {

  return async (dispatch: Dispatch<AppActionTypes>) => {
    dispatch(setLoading(true));
    let Result: any
    try {
      Result = await executeGetRequest(
        'api/currencies',
      );
      if (Result.code == 200) {
        dispatch(storeCurruncy(Result.response))
      }
      console.log("Languages===>", Result);

      dispatch(setLoading(false));
      return Result

    } catch (error) {
      dispatch(setLoading(false));
      showAlert(error)
      return Result

    }
  };
};


/**
 * API for upload new events
 * @param data Image url
 * @returns Responce from API
 */
export const CreateEventAction = (data: any) => {
  console.log("url ==", data);

  return async (dispatch: Dispatch<AppActionTypes>, getState: () => RootState,) => {
    const token = getState().persistedReducer.token;
    dispatch(setLoading(true));
    let Result: any
    try {
      Result = await executePostRequest(
        'api/events',
        data,
        token
      );
      if (Result.code == 200) {

      }
      console.log("create event Result===>", Result);

      dispatch(setLoading(false));
      return Result

    } catch (error) {
      dispatch(setLoading(false));
      showAlert(error)
      return Result

    }
  };
};


/**
 * API for get Filters
 * @returns Responce from API
 */
export const getFiltersAction = () => {

  return async (dispatch: Dispatch<AppActionTypes>) => {
    dispatch(setLoading(true));
    let Result: any
    try {
      Result = await executeGetRequest(
        'api/sorts-and-filters',
      );
      if (Result.code == 200) {
        dispatch(storeFilters(Result.response))
      }
      console.log("Languages===>", Result);

      dispatch(setLoading(false));
      return Result

    } catch (error) {
      dispatch(setLoading(false));
      showAlert(error)
      return Result

    }
  };
};

/**
 * API for resend otp
 * @param data Image url
 * @returns Responce from API
 */
export const resendOtpAction = (token) => {
  console.log("api tocken", token);

  return async (dispatch: Dispatch<AppActionTypes>, getState: () => RootState,) => {
    // const token = getState().persistedReducer.token;
    dispatch(setLoading(true));
    let Result: any
    try {
      Result = await executePostRequest(
        'api/resend-verification-code',
        "",
        token
      );
      if (Result.code == 200) {

      }
      console.log("resend otp===>", Result);

      dispatch(setLoading(false));
      return Result

    } catch (error) {
      dispatch(setLoading(false));
      showAlert(error)
      return Result

    }
  };
};


/**
 * API for getEvents according to params or filters
 * @param data Image url
 * @returns Responce from API
 */
export const eventsAction = (url) => {

  return async (dispatch: Dispatch<AppActionTypes>, getState: () => RootState,) => {
    const token = getState().persistedReducer.token;
    dispatch(setLoading(true));
    let Result: any
    try {
      Result = await executeGetRequest(
        `api/events?${url}`,
        token
      );
      if (Result.code == 200) {

      }
      console.log("get events ===> " + `api/events?${url}`, Result, token);

      dispatch(setLoading(false));
      return Result

    } catch (error) {
      dispatch(setLoading(false));
      showAlert(error)
      return Result

    }
  };
};

/**
 * API for getEvents according to params or filters
 * @param data Image url
 * @returns Responce from API
 */
export const UsersGetAction = (url) => {

  return async (dispatch: Dispatch<AppActionTypes>, getState: () => RootState,) => {
    const token = getState().persistedReducer.token;
    dispatch(setLoading(true));
    let Result: any
    try {
      Result = await executeGetRequest(
        `api/${url}`,
        token
      );
      if (Result.code == 200) {

      }
      console.log("get events ===> " + `api/events?${url}`, Result, token);

      dispatch(setLoading(false));
      return Result

    } catch (error) {
      dispatch(setLoading(false));
      showAlert(error)
      return Result

    }
  };
};


/**
 * API for resend otp
 * @param data Image url
 * @returns Responce from API
 */
export const changePasswordAction = (data: any) => {

  return async (dispatch: Dispatch<AppActionTypes>, getState: () => RootState,) => {
    const token = getState().persistedReducer.token;
    dispatch(setLoading(true));
    let Result: any
    try {
      Result = await executePostRequest(
        'api/resend-verification-code',
        data,
        token
      );
      if (Result.code == 200) {

      }
      console.log("change password===>", Result);

      dispatch(setLoading(false));
      return Result

    } catch (error) {
      dispatch(setLoading(false));
      showAlert(error)
      return Result

    }
  };
};



/**
 * API for edit event
 * @param data 6 digit code
 * @returns Responce from API
 */
export const EditEventAction = (data: any, id: any) => {
  return async (dispatch: Dispatch<AppActionTypes>, getState: () => RootState,) => {
    const token = getState().persistedReducer.token;
    dispatch(setLoading(true));
    let Result: any
    try {
      Result = await executePutRequest(
        `api/events/${id}`,
        data,
        token
      );
      if (Result.code == 200) {
        // dispatch(setAccessToken(Result.response.access_token))
      }
      console.log("result Edit profile===>", Result);

      dispatch(setLoading(false));
      return Result

    } catch (error) {
      dispatch(setLoading(false));
      showAlert(error)
      return Result

    }
  };
};

/**
 * API for delete event by id
 * @returns Responce from API
 */
export const deleteEventsAction = (id: any) => {

  return async (dispatch: Dispatch<AppActionTypes>, getState: () => RootState,) => {
    const token = getState().persistedReducer.token;
    dispatch(setLoading(true));
    let Result: any
    try {
      Result = await executeDeleteRequest(
        `api/events/${id}`,
        token
      );
      if (Result.code == 200) {

      }
      console.log("delete events ===> ", id, Result, token);

      dispatch(setLoading(false));
      return Result

    } catch (error) {
      dispatch(setLoading(false));
      showAlert(error)
      return Result

    }
  };
};


/**
 * API for follow and unfollow user/ also use for fav and unfav
 * @param action follow or unfollow/ fav or unfav
 * @param userId user id 
 * @returns Responce from API
 */
export const FollowUnfollowUserAction = (userID: any, action) => {

  return async (dispatch: Dispatch<AppActionTypes>, getState: () => RootState,) => {
    const token = getState().persistedReducer.token;
    console.log("tocken===>", token);

    dispatch(setLoading(true));
    let Result: any
    try {
      Result = await executePostRequest(
        `api/organisers/${userID}/${action}`,
        "",
        token
      );
      dispatch(setLoading(false));
      return Result

    } catch (error) {
      dispatch(setLoading(false));
      showAlert(error)
      return Result

    }
  };
};

/**
 * API for follow and unfollow user/ also use for fav and unfav
 * @param action follow or unfollow/ fav or unfav
 * @param userId user id 
 * @returns Responce from API
 */
export const FavUnfavUserAction = (userID: any, action) => {

  return async (dispatch: Dispatch<AppActionTypes>, getState: () => RootState,) => {
    const token = getState().persistedReducer.token;
    console.log("tocken===>", token);

    dispatch(setLoading(true));
    let Result: any
    try {
      Result = await executePostRequest(
        `api/events/${userID}/${action}`,
        "",
        token
      );
      dispatch(setLoading(false));
      return Result

    } catch (error) {
      dispatch(setLoading(false));
      showAlert(error)
      return Result

    }
  };
};


/**
 * API for add new post 
 * @param data Image url and description
 * @returns Responce from API
 */
export const addPostAction = (data: any) => {

  return async (dispatch: Dispatch<AppActionTypes>, getState: () => RootState,) => {
    const token = getState().persistedReducer.token;
    dispatch(setLoading(true));
    let Result: any
    try {
      Result = await executePostRequest(
        'api/posts',
        data,
        token
      );
      if (Result.code == 200) {

      }
      console.log("add post===>", Result);

      dispatch(setLoading(false));
      return Result

    } catch (error) {
      dispatch(setLoading(false));
      showAlert(error)
      return Result

    }
  };
};



/**
 * API for get posts
 * @param data user id
 * @returns Responce from API
 */
export const getPostAction = (id) => {

  return async (dispatch: Dispatch<AppActionTypes>, getState: () => RootState,) => {
    const token = getState().persistedReducer.token;
    // dispatch(setLoading(true));
    let Result: any
    try {
      Result = await executeGetRequest(
        `api/posts?user_id=${id}`,
        token
      );
      if (Result.code == 200) {
        dispatch(storePosts(Result?.response?.data))
      }
      console.log("get posts ===> ", Result);

      dispatch(setLoading(false));
      return Result

    } catch (error) {
      dispatch(setLoading(false));
      showAlert(error)
      return Result

    }
  };
};


/**
 * API for delete post by id
 * @returns Responce from API
 */
export const deletePostAction = (id: any) => {
  console.log("herererere");

  return async (dispatch: Dispatch<AppActionTypes>, getState: () => RootState,) => {
    const token = getState().persistedReducer.token;
    dispatch(setLoading(true));
    let Result: any
    try {
      Result = await executeDeleteRequest(
        `api/posts/${id}`,
        token
      );
      if (Result.code == 200) {

      }
      console.log("delete events ===> ", id, Result, token);

      dispatch(setLoading(false));
      return Result

    } catch (error) {
      dispatch(setLoading(false));
      showAlert(error)
      return Result

    }
  };
};


/**
 * API for get folowwers
 * @returns Responce from API
 */
export const getFolowersAndFollowingAction = (userId, type) => {
  return async (dispatch: Dispatch<AppActionTypes>, getState: () => RootState,) => {
    const token = getState().persistedReducer.token;
    // isLOader == true ? dispatch(setLoading(true)) : null
    dispatch(setLoading(true))
    let Result: any
    try {
      Result = await executeGetRequest(
        `api/organisers/${userId}/${type}`,
        token
      );
      if (Result.code == 200) {
      }
      console.log("folowers===>", Result);

      dispatch(setLoading(false));
      return Result

    } catch (error) {
      dispatch(setLoading(false));
      console.log("EventsError===>", error, Result);
      showAlert(error)
      return Result

    }
  };
};


/**
 * API for forgot password
 * @param data email address
 * @returns Responce from API
 */
export const ForgotPasswordAction = (data: any) => {
  return async (dispatch: Dispatch<AppActionTypes>, getState: () => RootState,) => {
    const token = getState().persistedReducer.token;
    dispatch(setLoading(true));
    let Result: any
    try {
      Result = await executePostRequest(
        `api/forgot-password`,
        data,
        token
      );
      if (Result.code == 200) {
        dispatch(setAccessToken(Result.response.access_token))
      }
      console.log("result forgot password===>", Result);

      dispatch(setLoading(false));
      return Result

    } catch (error) {
      dispatch(setLoading(false));
      showAlert(error)
      return Result

    }
  };
};


/**
 * API for resend otp
 * @param data Image url
 * @returns Responce from API
 */
export const changePasswordFromFrogotPasswordAction = (data: any) => {
  console.log("data===>", data);

  return async (dispatch: Dispatch<AppActionTypes>, getState: () => RootState,) => {
    const token = getState().persistedReducer.token;
    dispatch(setLoading(true));
    let Result: any
    try {
      Result = await executePostRequest(
        'api/reset-password',
        data,
      );
      if (Result.code == 200) {

      }
      console.log("change password===>", Result);

      dispatch(setLoading(false));
      return Result

    } catch (error) {
      dispatch(setLoading(false));
      showAlert(error)
      return Result

    }
  };
};


/**
 * API for saved events 
 * @returns Responce from API
 */
export const getSavedEvents = () => {
  return async (dispatch: Dispatch<AppActionTypes>, getState: () => RootState,) => {
    const token = getState().persistedReducer.token;
    // isLOader == true ? dispatch(setLoading(true)) : null
    dispatch(setLoading(true))
    let Result: any
    try {
      Result = await executeGetRequest(
        `api/events-fav`,
        token
      );
      if (Result.code == 200) {
      }
      console.log("Saved events ===>", Result);

      dispatch(setLoading(false));
      return Result

    } catch (error) {
      dispatch(setLoading(false));
      console.log("Saved events error===>", error, Result);
      showAlert(error)
      return Result

    }
  };
};