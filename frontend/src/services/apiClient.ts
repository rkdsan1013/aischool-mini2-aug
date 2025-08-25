// src/services/apiClient.ts
import axios, {
  AxiosError,
  AxiosResponse,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

type Method = "get" | "post" | "put" | "patch" | "delete";

// 서버가 돌아가는 주소를 .env로 관리합니다
const API_BASE = import.meta.env.VITE_API_URL || "";

// 백엔드에서 에러 응답에 붙여주는 형태
export interface ApiErrorResponse {
  message?: string;
  [key: string]: unknown;
}

// 커스텀 에러 클래스
export class ApiError extends Error {
  public statusCode?: number;
  public data?: ApiErrorResponse;

  constructor(message: string, statusCode?: number, data?: ApiErrorResponse) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.data = data;
  }
}

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 0,
});

// 요청 인터셉터 (여기에 토큰 등 헤더 추가 가능)
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);
// 응답 인터셉터: 에러를 ApiError로 감싸서 던집니다
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<unknown>) => {
    let message = "알 수 없는 오류가 발생했습니다.";
    let statusCode: number | undefined;
    let data: ApiErrorResponse | undefined;

    if (error.response) {
      statusCode = error.response.status;
      // 에러 바디가 ApiErrorResponse 형태라고 가정
      data = error.response.data as ApiErrorResponse;
      if (data?.message && typeof data.message === "string") {
        message = data.message;
      }
    } else if (error.message) {
      message = error.message;
    }

    if (import.meta.env.DEV) {
      console.error("API Error:", error);
    }

    return Promise.reject(new ApiError(message, statusCode, data));
  }
);

// 공통 요청 함수
async function request<T>(
  method: Method,
  url: string,
  payload?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  let response: AxiosResponse<T>;

  if (method === "get" || method === "delete") {
    response = await axiosInstance[method]<T>(url, config);
  } else {
    response = await axiosInstance[method]<T>(url, payload, config);
  }

  return response.data;
}

// HTTP 메서드별 래퍼
export const get = <T>(url: string, config?: AxiosRequestConfig) =>
  request<T>("get", url, undefined, config);

export const post = <T>(
  url: string,
  payload?: unknown,
  config?: AxiosRequestConfig
) => request<T>("post", url, payload, config);

export const put = <T>(
  url: string,
  payload?: unknown,
  config?: AxiosRequestConfig
) => request<T>("put", url, payload, config);

export const patch = <T>(
  url: string,
  payload?: unknown,
  config?: AxiosRequestConfig
) => request<T>("patch", url, payload, config);

export const remove = <T>(url: string, config?: AxiosRequestConfig) =>
  request<T>("delete", url, undefined, config);

export default axiosInstance;
