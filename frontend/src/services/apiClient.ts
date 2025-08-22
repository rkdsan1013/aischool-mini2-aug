import axios, {
  AxiosError,
  AxiosResponse,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

// API 에러 응답 타입
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

// Axios 인스턴스
const axiosInstance = axios.create({
  baseURL: "http://localhost:8000", // 환경변수 대신 직접 지정
  timeout: 15_000,
});

// 요청 인터셉터 (토큰 없음)
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // 필요 시 여기서 헤더 추가 가능
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// 응답 인터셉터
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

// HTTP 메서드 유틸
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
