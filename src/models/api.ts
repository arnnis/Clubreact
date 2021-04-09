export type APIResult<T> = T & {
  success: boolean;
  error_message?: string;
};
