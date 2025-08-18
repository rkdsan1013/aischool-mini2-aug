import axios, {
  AxiosError,
  AxiosResponse,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosHeaders,
} from "axios";

// API 에러 응답 인터페이스
interface ApiErrorResponse {
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
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 15_000,
});

// 요청 인터셉터: 토큰을 AxiosHeaders에 안전하게 추가
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // 기존 헤더를 AxiosHeaders 인스턴스로 래핑
    const headers = new AxiosHeaders(config.headers);
    const token = window.localStorage.getItem("token");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    config.headers = headers;
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// 응답 인터셉터: 에러 메시지를 일관된 ApiError로 포장
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    let message = "알 수 없는 오류가 발생했습니다.";
    let statusCode: number | undefined;
    let data: ApiErrorResponse | undefined;

    if (error.response) {
      statusCode = error.response.status;
      data = error.response.data as ApiErrorResponse;
      message = data.message ?? message;
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
const request = async <T>(
  method: "get" | "post" | "put" | "patch" | "delete",
  url: string,
  payload?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  let response: AxiosResponse<T>;

  if (method === "get" || method === "delete") {
    response = await axiosInstance[method]<T>(url, config);
  } else {
    response = await axiosInstance[method]<T>(url, payload, config);
  }

  return response.data;
};

// HTTP 메서드 유틸리티
export const get = <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
  request<T>("get", url, undefined, config);

export const post = <T>(
  url: string,
  payload?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => request<T>("post", url, payload, config);

export const put = <T>(
  url: string,
  payload?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => request<T>("put", url, payload, config);

export const patch = <T>(
  url: string,
  payload?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => request<T>("patch", url, payload, config);

export const remove = <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => request<T>("delete", url, undefined, config);

export default axiosInstance;
