export interface UseCase<TRequest = any, TResponse = any> {
  execute(request: TRequest): Promise<TResponse>;
}
