import { ADD_CATEGORY, CLEAR_CATEGORY } from '../types'

export function setCategoryData(cateData: object) {
    return {
        type: ADD_CATEGORY,
        payload: cateData
    };
}
export function clearCategory() {
    return {
        type: CLEAR_CATEGORY,
    };
}