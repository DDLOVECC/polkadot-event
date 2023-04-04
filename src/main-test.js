const {ApiPromise, WsProvider, Keyring} = require('@polkadot/api');
const main = async () => {
    console.log('finish')
}
const Web_Socket = "ws://127.0.0.1:9944";
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const connectSubLocalNode = async () => {
    const wsProvider = new WsProvider(Web_Socket);
    const api = await ApiPromise.create({provider: wsProvider, types: {}});
    await api.isReady;
    console.log("connected")
    return api;
}

const getConst = async (api) => {
    const exit = await api.consts.balances.existentialDeposit.toHuman();
    return exit;
}

const getBalance = async (api, address) => {
    const account = await api.query.system.account(address);
    return account["data"]["free"].toHuman();
}

const getAlineAndBobBalance = async (api) => {
    const keyring = new Keyring({type: 'sr25519'});
    const alice = keyring.addFromUri('//Alice');
    const bob = keyring.addFromUri('//Bob');
    console.log("alice balance is:{}", await getBalance(api, alice.address))
    console.log("bob balance is:{}", await getBalance(api, bob.address))
}

const transferFromAliceToBob = async (api, amount) => {
    const keyring = new Keyring({type: 'sr25519'});
    const alice = keyring.addFromUri('//Alice');
    const bob = keyring.addFromUri('//Bob');
    await api.tx.balances
        .transfer(bob.address, amount)
        .signAndSend(alice, result => {
            console.log("Tx:", result.status)
        })
}

const subscribeAliceBalance = async (api) => {
    const keyring = new Keyring({type: 'sr25519'});
    const alice = keyring.addFromUri('//Alice');
    await api.query.system.account(alice.address, aliceAcc => {
        console.log("sub alice account");
        const aliceFeeSub = aliceAcc.data.fee;
        console.log("sub Fee:{}", aliceFeeSub)
    })
}

main().then(async () => {
    const api = await connectSubLocalNode();
    const constValue = await getConst(api);
    await getAlineAndBobBalance(api);
    await transferFromAliceToBob(api, 10 ** 12);
    await sleep(8000);
    await getAlineAndBobBalance(api);

    await subscribeAliceBalance(api);
    await sleep(80000);
    console.log("constValue:", constValue);
    console.log("success exit");
    process.exit(0);
})
    .catch(() => {
        console.log("error exit");
        process.exit(1);
    })
