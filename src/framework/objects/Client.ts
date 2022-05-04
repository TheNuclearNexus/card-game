import * as ExpoLocation from "expo-location";
import { EmitterSubscription } from "react-native";
import { EventEmitter, EventListener } from "./EventEmitter";

import EventSource from "react-native-event-source";
import NetInfo from '@react-native-community/netinfo'
import * as SecureStore from 'expo-secure-store';
import UUID from 'react-native-uuid';
import { setCardDatabase } from "../interfaces/Card";
import ServerEvent from "../interfaces/ServerEvent";
import { LatLongToXY } from "../../util/utm";

type ClientEvents = 'load'|
                    'tick'|
                    'location-update'|
                    'heading-update'|
                    'update-players'


const url = 'http://2.tcp.ngrok.io:10022'

export class Client {
    private static _emitter: EventEmitter 
    private static _tickTimer: NodeJS.Timer|undefined
    private static _locationSub: ExpoLocation.LocationSubscription|undefined
    private static _headingSub: ExpoLocation.LocationSubscription;

    public static players: {id: string, x: number, y: number}[] = []
    public static id: string;

    private static _tick() {
        // TODO: eliminate johnny
        Client._emitter.emit('tick')
    }

    public static log(text: string) {
        console.log(`[${new Date(Date.now()).toLocaleTimeString()}] (${Client.id ?? ''}) ${text}`)

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
        Client.log(`Coords: ${location.coords.latitude} ${location.coords.longitude}`)
        Client._emitter.emit('location-update', location)
        fetch(url + `/location?id=${Client.id}&x=${location.coords.latitude}&y=${location.coords.longitude}`, {method: 'POST'})
    }

    private static async _onHeadingUpdate(heading: ExpoLocation.LocationHeadingObject) {
        Client._emitter.emit('heading-update', heading)
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
        this._locationSub = await ExpoLocation.watchPositionAsync({accuracy: ExpoLocation.Accuracy.BestForNavigation, distanceInterval: 2}, this._onLocationUpdate);
        this._headingSub = await ExpoLocation.watchHeadingAsync(this._onHeadingUpdate);
        //#endregion
        //#region Check for an internet connection
        Client.log('Checking Internet Connection!')
        const info = await NetInfo.fetch()
        if(!info.isConnected)
            Client.log('No Internet Connection!')
        //#endregion
        //#region Connect to the server
        const events = new EventSource(url + `/connect?id=${this.id}&x=0&y=0`)
        events.addEventListener('message', this._recvEvent)
        
        //#endregion
        Client.log('Client Loaded!')
        Client._emitter.emit('load')

        Client._tickTimer = setInterval(Client._tick, 1000/60)

    }

    private static _setPlayers(players: {id: string, x: number, y: number}[]) {
        players = players.filter(p => p.id !== this.id).map(p => {
            const c = LatLongToXY(p.x, p.y)
            p.x = c.x
            p.y = c.y
            return p
        })
        Client.players = players
        Client._emitter.emit('update-players')
    }

    private static _recvEvent(event: any) {
        const data: ServerEvent = JSON.parse(event.data)
        Client.log(data.id)
        if(data.id === 'init') {
            Client._setPlayers(data.clients)
            setCardDatabase(data.cards)
        } 
        else if(data.id === 'update-players') {
            Client._setPlayers(data.clients)
        }
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
