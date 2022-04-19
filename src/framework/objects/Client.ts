import * as ExpoLocation from "expo-location";
import { EmitterSubscription } from "react-native";
import { EventEmitter, EventListener } from "./EventEmitter";
import NetInfo from '@react-native-community/netinfo'
import * as SecureStore from 'expo-secure-store';
import UUID from 'react-native-uuid';
type ClientEvents = 'load'|'tick'|'location-update'

export class Client {
    private static _emitter: EventEmitter 
    private static _tickTimer: NodeJS.Timer|undefined
    private static _locationSub: ExpoLocation.LocationSubscription|undefined

    public static id: string;

    private static _tick() {
        // TODO: make tick work without spamming errors
        // TODO: eliminate johnny
        Client._emitter.emit('tick')
    }

    public static log(text: string) {
        console.log(`[${new Date(Date.now()).toLocaleTimeString()}] ${text}`)

    }

    private static async _getId() {
    
        const fetchUUID = await SecureStore.getItemAsync('secure_deviceid');
        //if user has already signed up prior
        if (fetchUUID != null && fetchUUID != 'null') {
            Client.log('Found UUID: ' + fetchUUID)
            this.id = fetchUUID
        }
        else {
            Client.log('No UUID found, generating new UUID')
            let newUUID = UUID.v1() as string
            Client.log(newUUID)
            this.id = newUUID;
            Client.log(newUUID)
            await SecureStore.setItemAsync('secure_deviceid', newUUID);
        }
    }

    private static async _onLocationUpdate(location: ExpoLocation.LocationObject) {
        Client._emitter.emit('location-update', location)
    }


    public static async start() {
        //#region Cleanup
        if(!Client._emitter) 
            Client._emitter = new EventEmitter()
        // else
            // Client._emitter.clear();

        if(Client._tickTimer) clearInterval(Client._tickTimer)
        //#endregion

        await this._getId();

        //#region Setup Location Services
        Client.log('Getting location services!')
        const response = await ExpoLocation.requestForegroundPermissionsAsync()
        if(!response.granted)
            Client.log('Failed to get location services!')
        
        if(this._locationSub !== undefined)
            this._locationSub.remove();
        this._locationSub = await ExpoLocation.watchPositionAsync({}, this._onLocationUpdate);
        //#endregion
        //#region Check for an internet connection
        Client.log('Checking Internet Connection!')
        const info = await NetInfo.fetch()
        if(!info.isConnected)
            Client.log('No Internet Connection!')
        //#endregion

        Client.log('Client Loaded!')
        Client._emitter.emit('load')

        Client._tickTimer = setInterval(Client._tick, 1000/60)

    }

    //#region All of the events logic

    public static on(type: ClientEvents, listener: EventListener) {
        if(!Client._emitter) Client._emitter = new EventEmitter()
        return Client._emitter.on(type, listener)
    }

    public static removeListener(type: ClientEvents, id: number) {
        if(!Client._emitter) Client._emitter = new EventEmitter()
        Client._emitter.removeListener(type, id)
    }
    //#endregion
}
