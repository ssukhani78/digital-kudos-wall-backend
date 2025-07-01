import { HttpResponse } from "./http-response";

export interface Controller<TRequest = any, TResponse = any> {
  handle(request: TRequest): Promise<HttpResponse<TResponse>>;
}
