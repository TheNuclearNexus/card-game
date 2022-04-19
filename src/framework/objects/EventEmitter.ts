
export type EventListener = (...args: any[]) => void

export class EventEmitter {
    _events: { [key: string]: {[key: number]: EventListener|undefined }} = {}
    _listenerNumber = 0
    constructor() {
        this._events = {};
    }

    on(name: string, listener: EventListener) {
        // console.log(this._events)
        if (!this._events[name]) {
            this._events[name] = {};
        }

        this._events[name][this._listenerNumber] = listener;
        this._listenerNumber += 1
        return this._listenerNumber - 1
    }

    removeListener(name: string, id: number) {
        if (!this._events[name]) {
            // throw new Error(`Can't remove a listener. Event "${name}" doesn't exits.`);
            return
        }

        this._events[name][id] = undefined
    }

    emit(name: string, ...args: any[]) {
        if (!this._events[name]) {
            return
        }

        const fireCallbacks = (callback: EventListener) => {
            callback(...args);
        };

        for(const l in this._events[name]) {
            const listener = this._events[name][l]
            if(listener)
                listener()
        }
    }

    clear() {
        this._events = {}
    }
}