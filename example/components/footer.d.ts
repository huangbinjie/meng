import * as React from 'react';
export default class Footer extends React.Component<any, Object> {
    state: any;
    render(): JSX.Element;
    add: (num: number) => (e: Event) => void;
    reduction: (num: number) => (e: Event) => void;
    timeoutHandle: (e: any) => Promise<void>;
}
