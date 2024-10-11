import axios, { AxiosInstance, AxiosResponse, CancelToken } from 'axios';

export type ApiCallParams<T> = {
    method: 'get' | 'post';
    path: string;
    params?: T;
    config?: any;
    cancelToken?: CancelToken;
    axiosInstance?: AxiosInstance;
    noAuth?: boolean;
};

export default async function apiCall<T, U = any>({
    method,
    path,
    params,
    cancelToken,
    config,
}: ApiCallParams<U>): Promise<T> {
    const parameters = method === 'get' ? { params } : { data: params };
    let requestPath = path;
    const headers: { [key: string]: string } = {};

    const requestConfig = {
        url: `${requestPath}`,
        method,
        cancelToken: cancelToken,
        ...config,
        ...parameters,
        headers,
    };

    return await axios(requestConfig).then((response: AxiosResponse<T>) => {
        return response.data;
    });
}
