import { ethers } from 'ethers';

// Registry Contract Config
const REGISTRY_ABI = [
    "function storeRecord(bytes32 _docHash, string memory _ipfsCid) public",
    "function verifyRecord(bytes32 _docHash) public view returns (bool exists, string memory ipfsCid, address doctor, uint256 timestamp)",
    "event RecordStored(bytes32 indexed docHash, string ipfsCid, address indexed doctor, uint256 timestamp)"
];

export const REGISTRY_ADDRESS = "0x9Af3D241D725dA7a61E9c83F102178af0A1e2C30";

export const getRegistryContract = async (signerOrProvider: ethers.Signer | ethers.Provider) => {
    return new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signerOrProvider);
};

// Escrow Contract Config
const ESCROW_ABI = [
    "function deposit(uint256 orderId) external payable",
    "function refund(uint256 orderId) external",
    "function getDeposit(uint256 orderId) external view returns (address patient, uint256 amount, bool active)",
    "event DepositReceived(uint256 indexed orderId, address indexed patient, uint256 amount)",
    "event RefundIssued(uint256 indexed orderId, address indexed patient, uint256 amount)"
];

export const ESCROW_ADDRESS = "0x09d8D93EC866deA410C77447dF9180b35D13E7df";

export const getEscrowContract = async (signerOrProvider: ethers.Signer | ethers.Provider) => {
    return new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signerOrProvider);
};

// Legacy support (to avoid breaking imports immediately, though we should update them)
export const getContract = getRegistryContract;
// ^ Deprecated: prefer specific getRegistryContract


export const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
            const provider = new ethers.BrowserProvider((window as any).ethereum);
            const signer = await provider.getSigner();
            return { provider, signer };
        } catch (error) {
            console.error("User rejected request", error);
            throw error;
        }
    } else {
        throw new Error("MetaMask not installed");
    }
};

export const hashPDF = async (pdfBlob: Blob): Promise<string> => {
    const buffer = await pdfBlob.arrayBuffer();
    const hash = ethers.keccak256(new Uint8Array(buffer));
    return hash;
};
