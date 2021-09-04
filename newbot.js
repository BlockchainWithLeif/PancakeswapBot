const ethers = require('ethers');
//This contains an Endpoint URL, and a wallet private key!!!
const secrets = require('./secrets.json');

//THIS WORK ON BSC TESTNET!!!!!

//All Values are for the testnet!!!!!!!!

const WBNB = "0xae13d989dac2f0debff460ac112a837c89baa7cd"; 
const BUSD = "0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7";

const router = "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3";

const provider = new ethers.providers.JsonRpcProvider(secrets.provider);
const wallet = new ethers.Wallet(secrets.privatekey);
const signer = wallet.connect(provider);

const routerContract = new ethers.Contract(
    router,
    [
        'function getAmountsOut(uint amountIn, address[] memory path) public view returns(uint[] memory amounts)',
        'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
    ],
    signer
);

const busdContract = new ethers.Contract(
    BUSD,
    [
        'function approve(address spender, uint256 amount) external returns (bool)'
    ],
    signer
)

async function main() {

    const BUSDamountIn = ethers.utils.parseUnits('100', 18);
    let amounts = await routerContract.getAmountsOut(BUSDamountIn, [BUSD, WBNB]);
    const WBNBamountOutMin = amounts[1].sub(amounts[1].div(10));

    console.log(ethers.utils.formatEther(BUSDamountIn));
    console.log(ethers.utils.formatEther(WBNBamountOutMin));

    const approveTx = await busdContract.approve(
        router,
        BUSDamountIn
    );
    let reciept = await approveTx.wait();
    console.log(reciept);

    const swapTx = await routerContract.swapExactTokensForTokens(
        BUSDamountIn,
        WBNBamountOutMin,
        [BUSD, WBNB],
        wallet.address,
        Date.now() + 1000 * 60 * 10,
        {gasLimit: 250000}
    )

    receipt = await swapTx.wait();
    console.log(receipt);
}

main().then().finally(() => {});
