// Import the API
const {ApiPromise, WsProvider} = require('@polkadot/api');
const Web_Socket = "ws://127.0.0.1:9944";
async function main () {
    const wsProvider = new WsProvider(Web_Socket);
    const api = await ApiPromise.create({provider: wsProvider, types: {}});

    // Subscribe to system events via storage
    api.query.system.events((events) => {
        console.log(`\nReceived ${events.length} events:`);
        events.forEach((record) => {
            // Extract the phase, event and the event types
            const { event } = record;
            const types = event.typeDef;

            // Show what we are busy with
            console.log(`method:${event.method}`);
            console.log(`meta:${event.meta}`);

            event.data.forEach((data, index) => {
                console.log(`eventData:${types[index].type}: ${data.toString()}`);
            });
        });
    });
}

main().catch((error) => {
    console.error(error);
    process.exit(-1);
});
