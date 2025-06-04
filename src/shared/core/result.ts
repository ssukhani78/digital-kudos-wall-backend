export class Result<T, E = string> {
  public isSuccess: boolean;
  public isFailure: boolean;
  private readonly _error: E;
  private readonly _value: T;

  private constructor(isSuccess: boolean, error?: E, value?: T) {
    if (isSuccess && error) {
      throw new Error("InvalidOperation: A result cannot be successful and contain an error");
    }

    if (!isSuccess && !error) {
      throw new Error("InvalidOperation: A failing result must contain an error message");
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this._error = error as E;
    this._value = value as T;
  }

  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error("Can't get the value of an error result. Use 'error' instead.");
    }

    return this._value;
  }

  public error(): E {
    return this._error;
  }

  public static ok<U>(value?: U): Result<U> {
    return new Result<U, string>(true, undefined, value);
  }

  public static fail<U, E = string>(error: E): Result<U, E> {
    return new Result<U, E>(false, error);
  }
}
