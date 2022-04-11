
export type EventListener = (...args: any[]) => void

export class EventEmitter {
    _events: { [key: string]: EventListener[] } = {}

    constructor() {
        this._events = {};
    }

    on(name: string, listener: EventListener) {
        // console.log(this._events)
        if (!this._events[name]) {
            this._events[name] = [];
        }

        this._events[name].push(listener);
    }

    removeListener(name: string, listenerToRemove: EventListener) {
        if (!this._events[name]) {
            throw new Error(`Can't remove a listener. Event "${name}" doesn't exits.`);
        }

        const filterListeners = (listener: EventListener) => listener !== listenerToRemove;

        this._events[name] = this._events[name].filter(filterListeners);
    }

    emit(name: string, ...args: any[]) {
        if (!this._events[name]) {
            return
        }

        const fireCallbacks = (callback: EventListener) => {
            callback(...args);
        };

        this._events[name].forEach(fireCallbacks);
    }
}