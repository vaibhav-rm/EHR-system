import axios from 'axios';

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

export async function uploadToPinata(file: Blob, fileName: string): Promise<string | null> {
    if (!PINATA_JWT) {
        console.error("Pinata JWT not found");
        return null; // Return null if not configured, or throw error
    }

    const formData = new FormData();
    formData.append('file', file, fileName);

    const metadata = JSON.stringify({
        name: fileName,
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
        cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    try {
        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            headers: {
                'Authorization': `Bearer ${PINATA_JWT}`
            }
        });
        return res.data.IpfsHash;
    } catch (error) {
        console.error("Error uploading to Pinata:", error);
        return null;
    }
}
