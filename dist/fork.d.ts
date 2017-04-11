import { Observable } from 'rxjs';
import { Resource, Success } from './inject';
export declare function fork<S>({source$, success}: Resource, store$?: Observable<[S, S]>): Observable<S>;
export declare const combineLatestSelector: (acc: Object, x: Object) => Object;
export declare const resetCallback: (state: Object) => Object & {
    callback: () => void;
};
export declare const implSelector: (success: Success) => (state: Object) => Object;
export declare const nullCheck: (state: Object) => boolean;
