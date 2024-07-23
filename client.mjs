import { RPCClient } from 'ocpp-rpc';
import { kill } from 'process';

const cli = new RPCClient({
    endpoint: 'ws://192.168.2.24:3000',
    identity: 'NLSHOE00024616',
    protocols: ['ocpp1.6'],
    strictMode: true,
    reconnect: true,
})

await cli.connect()

const bootResponse = await cli.call('BootNotification', {
    chargePointVendor: 'alfen',
    chargePointModel: 'eve_pro_line_single',
})

if (bootResponse.status !== 'Accepted') kill()

setInterval(async () => {
    await cli.call('Heartbeat', {})
}, 10000)

await cli.call('Heartbeat', {})

await cli.call('StatusNotification', {
    connectorId: 0,
    errorCode: "NoError",
    status: "Available",
})
