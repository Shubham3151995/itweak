
import { Log } from './Logger'
// import { AUTH_ERROR } from '../redux/types';
import store from '../redux/reducers';

export const checkResponse = async (res: Response) => {
    Log(`Response Status for ${res.url} code : ${res.status}`, res.clone().json())
    const response = await res.clone().json()
    // Log(response, "responseData")
    // if (response.code == 422 && response.messages[0] === "User not authenticated") {
    //     Log("user not found")
    //     store.dispatch({ type: AUTH_ERROR, payload: "Token expire" });
    // }
    // else if (res.status == 500) {
    //     store.dispatch({ type: AUTH_ERROR, payload: "JWT Error" });
    // }
}