const { ApiPromise } = require('@polkadot/api');
const testKeyring = require('@polkadot/keyring/testing');
const { randomAsU8a } = require('@polkadot/util-crypto');

const ALICE = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
const AMOUNT = 10000;

async function main () {
    const api = await ApiPromise.create();

    const keyring = testKeyring.default();

    const { nonce } = await api.query.system.account(ALICE);

    const alicePair = keyring.getPair(ALICE);

    const recipient = keyring.addFromSeed(randomAsU8a(32)).address;

    console.log('Sending', AMOUNT, 'from', alicePair.address, 'to', recipient, 'with nonce', nonce.toString());

    // Do the transfer and track the actual status
    api.tx.balances
        .transfer(recipient, AMOUNT)
        .signAndSend(alicePair, { nonce }, ({ events = [], status }) => {
            console.log('Transaction status:', status.type);

            if (status.isInBlock) {
                console.log('Included at block hash', status.asInBlock.toHex());
                console.log('Events:');

                events.forEach(({ event: { data, method, section }, phase }) => {
                    console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
                });
            } else if (status.isFinalized) {
                console.log('Finalized block hash', status.asFinalized.toHex());

                process.exit(0);
            }
        });
}

main().catch(console.error);