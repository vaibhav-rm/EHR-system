import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import solc from 'solc';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function main() {
    const privateKey = process.env.PRIVATE_KEY;
    const rpcUrl = process.env.SEPOLIA_RPC_URL;

    if (!privateKey || !rpcUrl) {
        console.error("❌ Missing PRIVATE_KEY or NEXT_PUBLIC_RPC_URL in .env.local");
        process.exit(1);
    }

    console.log("Compiling Smart Contract...");
    const contractPath = path.resolve(__dirname, '../contracts/MedicineEscrow.sol');
    const source = fs.readFileSync(contractPath, 'utf8');

    const input = {
        language: 'Solidity',
        sources: {
            'MedicineEscrow.sol': {
                content: source,
            },
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*'],
                },
            },
        },
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    const contractFile = output.contracts['MedicineEscrow.sol']['MedicineEscrow'];

    if (!contractFile) {
        console.error("❌ Compilation Failed:", output.errors);
        process.exit(1);
    }

    const abi = contractFile.abi;
    const bytecode = contractFile.evm.bytecode.object;

    console.log("Connecting to Sepolia...");
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log(`Deploying from address: ${wallet.address}`);

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy();

    console.log("Waiting for deployment transaction...");
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log("\n✅ MedicineEscrow Contract Deployed Successfully!");
    console.log(`📍 Contract Address: ${address}`);
    console.log("\nPlease update SRC/LIB/WEB3.TS with this address.");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
