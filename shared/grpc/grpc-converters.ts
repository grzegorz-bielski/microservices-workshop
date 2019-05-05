import { Observable, Observer } from 'rxjs';
import * as grpc from 'grpc';

export const toPromise = <T, S>(client: any, method: string) => {
  return (request: T) => {
    return new Promise<S>((resolve, reject) => {
      client[method](request, (error: Error, value: S) => {
        if (error) {
          return reject(error);
        }
        resolve(value);
      });
    });
  };
};

export const toObservable = <T, S>(client: any, method: string) => {
  return (request: T) => {
    return new Promise<Observable<S>>((resolve, reject) => {
      try {
        const call = client[method](request);
        const observable = Observable.create((observer: Observer<S>) => {
          call.on('data', (data: S) => observer.next(data));
          call.on('error', (error: any) => {
            if (error.code === grpc.status.CANCELLED) {
              return;
            }

            return observer.error(error);
          });
          call.on('end', () => observer.complete());

          return () => {
            call.cancel();
          };
        });

        resolve(observable);
      } catch (e) {
        reject(e);
      }
    });
  };
};
