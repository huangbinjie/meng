/// <reference types="core-js" />
import { Observable, ReplaySubject } from 'rxjs';
import { Resource, Success } from './inject';
export declare function fork<S>(state$: ReplaySubject<S>, {source$, success}: Resource): Observable<S>;
export declare const combineLatestSelector: (acc: Object, x: Object) => Object;
export declare const resetCallback: (state: Object) => Object & {
    callback: () => void;
};
export declare const implSelector: (success: Success) => (state: Object) => Object;
