import fs from 'fs';
import path from 'path';
import solc from 'solc';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load env
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.error("❌ PRIVATE_KEY is missing in .env.local");
        process.exit(1);
    }

    const rpcUrl = process.env.SEPOLIA_RPC_URL;
    if (!rpcUrl) {
        console.error("❌ SEPOLIA_RPC_URL is missing in .env.local");
        process.exit(1);
    }

    console.log("Compiling Smart Contract...");
    const contractPath = path.resolve(__dirname, '../contracts/MedicalRecordRegistry.sol');
    const source = fs.readFileSync(contractPath, 'utf8');

    const input = {
        language: 'Solidity',
        sources: {
            'MedicalRecordRegistry.sol': {
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

    if (output.errors) {
        let hasError = false;
        output.errors.forEach((err: any) => {
            if (err.severity === 'error') {
                console.error(err.formattedMessage);
                hasError = true;
            } else {
                console.warn(err.formattedMessage);
            }
        });
        if (hasError) process.exit(1);
    }

    const contractFile = output.contracts['MedicalRecordRegistry.sol']['MedicalRecordRegistry'];
    const bytecode = contractFile.evm.bytecode.object;
    const abi = contractFile.abi;

    console.log("Connecting to Sepolia...");
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log(`Deploying from address: ${wallet.address}`);

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy();

    console.log("Waiting for deployment transaction...");
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log(`\n✅ Contract Deployed Successfully!`);
    console.log(`📍 Contract Address: ${address}`);
    console.log(`\nPlease update SRC/LIB/WEB3.TS with this address.`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
