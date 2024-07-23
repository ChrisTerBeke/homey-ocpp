import { Device } from 'homey'
import { IHandlersOption } from 'ocpp-rpc/lib/client'

type BootNotificationPayload = {
    status: string
    interval: number
    currentTime: string
}

type HeartBeatPayload = {
    currentTime: string
}

type StatusNotificationPayload = {}

export interface IOCPPCharger {
    onBootNotification(options: IHandlersOption): Promise<BootNotificationPayload>
    onHeartbeat(options: IHandlersOption): Promise<HeartBeatPayload>
    onStatusNotification(options: IHandlersOption): Promise<StatusNotificationPayload>
}

class OCCPCharger extends Device implements IOCPPCharger {

    async onInit(): Promise<void> {

    }

    async onUninit(): Promise<void> {

    }

    async onAdded(): Promise<void> {

    }

    async onBootNotification(): Promise<BootNotificationPayload> {
        return {
            status: 'Accepted',
            interval: 300,
            currentTime: new Date().toISOString(),
        }
    }

    async onHeartbeat(): Promise<HeartBeatPayload> {
        return {
            currentTime: new Date().toISOString(),
        }
    }

    async onStatusNotification(): Promise<StatusNotificationPayload> {
        return {}
    }
}

module.exports = OCCPCharger
