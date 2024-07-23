import { DiscoveryResultMDNSSD, Driver } from 'homey'
import { PairSession } from 'homey/lib/Driver'

class OCPPDriver extends Driver {

    async onPair(session: PairSession) {
        const driver = this

        session.setHandler('list_devices', async function () {
            const discoveryStrategy = driver.getDiscoveryStrategy()
            const discoveryResults = discoveryStrategy.getDiscoveryResults() as { [key: string]: DiscoveryResultMDNSSD }
            return Object.values(discoveryResults).map((result: DiscoveryResultMDNSSD) => {
                return {
                    name: result.name,
                    data: {
                        id: result.name,
                    },
                    store: {
                        address: result.address,
                        host: result.host,
                        port: result.port,
                    }
                }
            })
        })
    }
}

module.exports = OCPPDriver
