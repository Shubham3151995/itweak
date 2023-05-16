import { LOADING_STATUS } from '../types'

export function setLoading(loading: boolean) {
    return {
        type: LOADING_STATUS,
        payload: loading
    };
}