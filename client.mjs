import { RPCClient } from 'ocpp-rpc';

const cli = new RPCClient({
    endpoint: 'ws://192.168.2.24:3000',
    identity: 'NLSHOE00024616',
    protocols: ['ocpp1.6'],
    strictMode: true,
})

await cli.connect()

const bootResponse = await cli.call('BootNotification', {
    chargePointVendor: 'alfen',
    chargePointModel: 'eve_pro_line_single',
})

if (bootResponse.status === 'Accepted') {
    const heartbeatResponse = await cli.call('Heartbeat', {})
    console.log('Server time is:', heartbeatResponse.currentTime)
    await cli.call('StatusNotification', {
        connectorId: 0,
        errorCode: "NoError",
        status: "Available",
    })
}
