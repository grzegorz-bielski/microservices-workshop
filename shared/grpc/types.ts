export type StreamEvents = 'data' | 'end' | 'error' | 'cancelled';

export type Callback<T> = (error: Error | null, response: T | null) => Promise<any> | any;

export interface Call<T> {
  request: T;
}

export type StreamEvent<T> = (event: StreamEvents, cb: (data: T) => void) => any;

export interface CallStream<T, U> {
  write: (input: T) => void;
  on: StreamEvent<U>;
  end: () => void;
  request: U;
}

export type Response<T> = T;
