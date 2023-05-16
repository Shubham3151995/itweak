import { Dispatch } from 'redux';
import { setLoading } from '../creators/LoadingCreator';
import {
    storeCategories
} from '../creators/AuthCreators';
import { AppActionTypes } from '../types';
import {
    executePostRequest,
    executeGetRequest,
    executePutRequest,
    executeDeleteRequest,
} from '../../utils/FetchUtils';
import { RootState } from '../reducers'
import { validateCategorie, CategoriesType } from '../../utils/ValidationHelper'

interface addRemovePeople {
    contactsId: string;
    catId: string;
    type: string;
}

/**
 * for add new Category
 * @param data :- title and Background color
 */
export const addCategoriesAction = (data: CategoriesType) => {
    return async (dispatch: Dispatch<AppActionTypes>, getState: () => RootState,) => {
        const token = getState().persistedReducer.token;
        dispatch(setLoading(true));
        const validationResult: any = await validateCategorie(data);
        if (validationResult.code == 400) {
            dispatch(setLoading(false));
            return validationResult;
        } else {
            try {
                dispatch(setLoading(true));
                const result: any = await executePostRequest(
                    'v1/category',
                    getAddCategoriesFormData(data),
                    token
                );

                dispatch(setLoading(false));
                console.log("Add Categories response--->>", result)
                return result
            } catch (err) {
                dispatch(setLoading(false));
                console.log({ err });
            }

        }

    };
};

/**
 * For Get Categories 
 */
export const getCategoriesAction = () => {
    return async (dispatch: Dispatch<AppActionTypes>, getState: () => RootState,) => {
        const token = getState().persistedReducer.token;
        // dispatch(setLoading(true));
        try {
            // dispatch(setLoading(true));
            const result: any = await executeGetRequest(
                'v1/category',
                token
            );
            dispatch(storeCategories(result.response.data))
            // dispatch(setLoading(false));
            console.log("Get Categories response--->>", result)
            return result

        } catch (err) {
            console.log({ err })
            // dispatch(setLoading(false));
        }

    };
};

/**
 * For Edit category
 * @param data :- newTitle , background color and category Id 
 */
export const editCategoriesAction = (data) => {
    console.log("data", data);

    return async (dispatch: Dispatch<AppActionTypes>, getState: () => RootState,) => {
        const token = getState().persistedReducer.token;
        dispatch(setLoading(true));
        const validationResult: any = await validateCategorie(data);
        if (validationResult.code == 400) {
            dispatch(setLoading(true));
            return validationResult;
        } else {
            dispatch(setLoading(true));
            const result: any = await executePutRequest(
                'v1/category',
                getEditCategoriesFormData(data),
                token
            );

            dispatch(setLoading(false));
            console.log("Edit Categories response--->>", result)
            return result

        }

    };
};

/**
 * For delete category
 * @param data CAtegory Id
 */

export const deleteCategoriesAction = (id: string) => {
    return async (dispatch: Dispatch<AppActionTypes>, getState: () => RootState,) => {
        const token = getState().persistedReducer.token;
        dispatch(setLoading(true));
        try {
            dispatch(setLoading(true));
            const result: any = await executeDeleteRequest(
                'v1/category',
                deleteCategoryFormData(id),
                token
            );
            dispatch(setLoading(false));
            console.log("Delete Categories response--->>", result)
            return result

        } catch (err) {
            console.log({ err })
            dispatch(setLoading(false));
        }

    };
};

/**
 * For Add and remove people from category
 * @param data :- people id's, category Id,type 0 for remove people and 1 for add new people in category 
 */
export const addRemoveCategoriesAction = (data: addRemovePeople) => {
    return async (dispatch: Dispatch<AppActionTypes>, getState: () => RootState,) => {
        const token = getState().persistedReducer.token;
        console.log("form data--->>>", getAddRemoveCategoriesFormData(data))
        dispatch(setLoading(true));
        try {
            dispatch(setLoading(true));
            const result: any = await executePutRequest(
                'v1/addremovepeople',
                getAddRemoveCategoriesFormData(data),
                token
            );

            dispatch(setLoading(false));
            console.log("Add remove Categories response--->>", result)
            return result

        } catch (err) {
            console.log({ err });
            dispatch(setLoading(false));
        }

    };
};
export const getCategoriesDetailsAction = (id: string) => {
    return async (dispatch: Dispatch<AppActionTypes>, getState: () => RootState,) => {
        const token = getState().persistedReducer.token;
        // dispatch(setLoading(true));
        try {
            // dispatch(setLoading(true));
            const result: any = await executePostRequest(
                'v1/categorydetails',
                getCategoriesDetailFormData(id),
                token
            );

            // dispatch(setLoading(false));
            console.log("Add Categories response--->>", result)
            return result
        } catch (err) {
            dispatch(setLoading(false));
            console.log({ err });
        }

    };
};

/**
 * form data for add new Category Api Body
 * @param data title and background color
 */
const getAddCategoriesFormData = (data: CategoriesType): FormData => {
    let formdata = new FormData();
    formdata.append('title', data.title);
    formdata.append('bgcolor', data.bgColor);
    return formdata;
}

/**
 * form data for Edit category Api Body
 * @param data title , background color and category id
 */

const getEditCategoriesFormData = (data): FormData => {
    let formdata = new FormData();
    formdata.append('title', data.title);
    formdata.append('bgcolor', data.bgColor);
    formdata.append('id', data.id);
    return formdata;
}

/**
 * for delete category Api Body data
 * @param id category id
 */
const deleteCategoryFormData = (id: string): FormData => {
    let formdata = new FormData()
    formdata.append('id', id)
    return formdata
}

/**
 * for add and remove contacts Api body data
 * @param data contacts id , category id and type 0 for remove and 1 for add contacts
 */
const getAddRemoveCategoriesFormData = (data: addRemovePeople): FormData => {
    let formdata = new FormData();
    formdata.append('people', data.contactsId);
    formdata.append('catid', data.catId);
    formdata.append('type', data.type);
    return formdata;
}
const getCategoriesDetailFormData = (id): FormData => {
    let formdata = new FormData();
    formdata.append('catid', id);
    return formdata;
}