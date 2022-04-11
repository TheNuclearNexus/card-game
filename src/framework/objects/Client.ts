import { EmitterSubscription } from "react-native";
import { EventEmitter, EventListener } from "./EventEmitter";

type ClientEvents = 'load'|'tick'

export class Client extends EventEmitter {

    constructor() {
        super()
    }

    _tick() {
        // TODO: make tick work without spamming errors
        // TODO: eliminate johnny
    }

    public log(text: string) {
        console.log(`[${new Date(Date.now()).toLocaleTimeString()}] ${text}`)

    }

    public async start() {
        this.log('Client Loaded!')
        super.emit('load')

    }

    //#region All of the events logic

    public on(type: ClientEvents, listener: EventListener) {
        super.on(type, listener)
    }

    public removeListener(type: ClientEvents, listener: EventListener) {
        super.removeListener(type, listener)
    }
    //#endregion
}

const client = new Client()
export default client 