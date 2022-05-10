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
import chalk from "chalk";
import { setGlobalScene } from "./SceneManager";
import { Battle } from "../interfaces/Battle";
import { wait } from "../../util/async";
import axios from "axios";
import SFX from "./SFX";
import { url } from "../../util/global_data";

type ClientEvents = 
      'load'
    | 'tick'
    | 'location-update'
    | 'heading-update'
    | 'battle-update'
    | 'update-players'


export class Client {
    private static _emitter: EventEmitter
    private static _tickTimer: NodeJS.Timer | undefined
    private static _locationSub: ExpoLocation.LocationSubscription | undefined
    private static _headingSub: ExpoLocation.LocationSubscription;
    private static _eventSource: EventSource
    private static _started: boolean
    
    public static lockAutoRequests: boolean = false;
    public static players: { id: string, x: number, y: number }[] = []
    public static id: string;
    private static _tick() {
        // TODO: eliminate johnny
        Client._emitter.emit('tick')
    }

    public static log(text: string) {
        console.log(chalk.gray(`[${new Date(Date.now()).toLocaleTimeString()}]`), chalk.greenBright(`(${Client.id ?? ''})`), text)
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

    public static async POST(data: string) {
        // Client.lockAutoRequests = true
        const finalUrl = url + `/${data}`
        // console.log(finalUrl)
        const resp = await axios.post(finalUrl, undefined, {timeout: 1000})
        // Client.lockAutoRequests = false
        return resp
    }



    public static async start() {
        if (this._started) {
            Client.log('Client has already been started!')
            return;
        }
        this._started = true;
        //#region Cleanup
        if (!Client._emitter)
            Client._emitter = new EventEmitter()
        // else
        // Client._emitter.clear();

        if (Client._tickTimer) clearInterval(Client._tickTimer)
        //#endregion

        await this._getId();

        //#region Setup Location Services
        Client.log('Getting location services!')
        const response = await ExpoLocation.requestForegroundPermissionsAsync()
        if (!response.granted)
            Client.log('Failed to get location services!')

        if (this._locationSub !== undefined)
            this._locationSub.remove();
        this._locationSub = await ExpoLocation.watchPositionAsync({ accuracy: ExpoLocation.Accuracy.Highest, distanceInterval: 0.5 }, this._onLocationUpdate);
        this._headingSub = await ExpoLocation.watchHeadingAsync(this._onHeadingUpdate);
        //#endregion
        //#region Check for an internet connection
        Client.log('Checking Internet Connection!')
        const info = await NetInfo.fetch()
        if (!info.isConnected)
            Client.log('No Internet Connection!')
        //#endregion
        //#region Connect to the server
        if (this._eventSource !== undefined)
            this._eventSource.close();
        this._eventSource = new EventSource(url + `/connect?id=${this.id}&x=0&y=0`, {})
        this._eventSource.addEventListener('message', this._recvEvent)
        this._eventSource.addEventListener('error', (event) => {console.log(event)})
        //#endregion
        await SFX.loadSounds()
        Client.log('Client Loaded!')
        Client._emitter.emit('load')

        Client._tickTimer = setInterval(Client._tick, 1000 / 60)

        const lastKnown = await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.Highest });


        if (lastKnown)
            this._onLocationUpdate(lastKnown)

    }

    private static _setPlayers(players: { id: string, x: number, y: number }[]) {
        players = players.filter(p => p.id !== this.id).map(p => {
            const c = LatLongToXY(p.x, p.y)
            p.x = c.x
            p.y = c.y
            return p
        })
        Client.players = players
        Client._emitter.emit('update-players')
    }

    private static async _recvEvent(event: any) {
        const data: ServerEvent = JSON.parse(event.data)
        if (data.id === 'init') {
            Client._setPlayers(data.clients)
            setCardDatabase(data.cards)
        }
        else if (data.id === 'update-players') {
            Client._setPlayers(data.clients)
        } 
        else if (data.id === 'goto-overworld') {
            setGlobalScene('overworld')
        }
        else if (data.id === 'start-battle') {
            // console.log(data.battle)
            setGlobalScene('combat')
            SFX.play('start-battle')

            await wait(150)
            Client._onBattleUpdate(data.battle as Battle)
        } 
        else if (data.id === 'update-battle') {
            Client._onBattleUpdate(data.battle as Battle)
        }
        else if (data.id === 'end-battle') {
            Client.log(data.type + ': ' + data.condition)
            setGlobalScene('overworld')
        }
    }

    //#region All of the events logic

    public static on(type: ClientEvents, listener: EventListener) {
        if (!Client._emitter) Client._emitter = new EventEmitter()
        return Client._emitter.on(type, listener)
    }

    public static removeListener(type: ClientEvents, id: number) {
        if (!Client._emitter) Client._emitter = new EventEmitter()
        Client._emitter.removeListener(type, id)
    }

    private static async _onLocationUpdate(location: ExpoLocation.LocationObject) {
        if (!location) return;
        // Client.log(`Coords: ${location.coords.latitude} ${location.coords.longitude}`)
        Client._emitter.emit('location-update', location)
        // if(!this.lockAutoRequests) 
        Client.POST(`location?id=${Client.id}&x=${location.coords.latitude}&y=${location.coords.longitude}`)
    }

    private static _onBattleUpdate(battle: Battle) {
        // Client.log(`Coords: ${location.coords.latitude} ${location.coords.longitude}`)
        Client._emitter.emit('battle-update', battle)
    }
    private static async _onHeadingUpdate(heading: ExpoLocation.LocationHeadingObject) {
        if (!heading) return;
        Client._emitter.emit('heading-update', heading)
    }

    //#endregion
}
