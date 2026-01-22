"use client";

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Shield, Loader2 } from 'lucide-react';
import { ethers } from 'ethers';
import { getContract, hashPDF, connectWallet } from '@/lib/web3';
import { useDropzone } from 'react-dropzone';

export default function VerifyRecordPage() {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'verifying' | 'valid' | 'invalid'>('idle');
    const [recordDetails, setRecordDetails] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setStatus('idle');
            setRecordDetails(null);
            setError(null);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1
    });

    const verifyRecord = async () => {
        if (!file) return;

        setStatus('verifying');
        setError(null);

        try {
            // 1. Hash the file
            const fileHash = await hashPDF(file);

            // 2. Connect to Blockchain (ReadOnly if possible, but we use connectWallet for simplicity)
            // Ideally we should use a JsonRpcProvider for read-only to avoid prompting user to connect wallet just to verify
            // But for now, let's use the browser provider
            const { provider } = await connectWallet(); 
            const contract = await getContract(provider);

            // 3. Call SC
            const result = await contract.verifyRecord(fileHash);
            
            // result = [exists, ipfsCid, doctorAddress, timestamp]
            const exists = result[0];
            
            if (exists) {
                setStatus('valid');
                setRecordDetails({
                    ipfsCid: result[1],
                    doctor: result[2],
                    timestamp: new Date(Number(result[3]) * 1000).toLocaleString()
                });
            } else {
                setStatus('invalid');
            }

        } catch (err: any) {
            console.error(err);
            setStatus('idle'); // Reset to allow retry
            setError(err.message || "Verification failed. Ensure you are on Sepolia network.");
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-neutral-100">
                <div className="p-8 text-center bg-white">
                    <div className="mx-auto w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-6">
                        <Shield className="h-8 w-8 text-teal-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-neutral-900 mb-2">Verify Medical Record</h1>
                    <p className="text-neutral-500">Upload a consultation record to verify its authenticity on the Ethereum blockchain.</p>
                </div>

                <div className="p-8 pt-0">
                    <div 
                        {...getRootProps()} 
                        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors cursor-pointer ${
                            isDragActive ? 'border-teal-500 bg-teal-50' : 'border-neutral-200 hover:border-teal-400'
                        }`}
                    >
                        <input {...getInputProps()} />
                        {file ? (
                            <div className="flex items-center justify-center gap-4 text-neutral-700">
                                <FileText className="h-8 w-8 text-teal-600" />
                                <div className="text-left">
                                    <p className="font-medium">{file.name}</p>
                                    <p className="text-xs text-neutral-400">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="mx-auto w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center">
                                    <Upload className="h-6 w-6 text-neutral-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-neutral-900">Click to upload or drag and drop</p>
                                    <p className="text-sm text-neutral-500">PDF files only</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm flex items-start gap-2">
                            <XCircle className="h-5 w-5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {status === 'valid' && (
                        <div className="mt-8 p-6 bg-green-50 border border-green-100 rounded-2xl animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center gap-3 mb-4">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                                <h3 className="text-lg font-bold text-green-900">Record Verified Authentic</h3>
                            </div>
                            <div className="space-y-2 text-sm text-green-800">
                                <div className="flex justify-between">
                                    <span className="opacity-70">Doctor Address:</span>
                                    <span className="font-mono text-xs">{recordDetails.doctor}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="opacity-70">Timestamp:</span>
                                    <span className="font-medium">{recordDetails.timestamp}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="opacity-70">IPFS CID:</span>
                                    <span className="font-mono text-xs">{recordDetails.ipfsCid}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'invalid' && (
                        <div className="mt-8 p-6 bg-red-50 border border-red-100 rounded-2xl animate-in fade-in slide-in-from-bottom-4 text-center">
                            <XCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-red-900">Invalid Record</h3>
                            <p className="text-red-700 text-sm mt-1">This document does not match any record stored on the blockchain.</p>
                        </div>
                    )}

                    <button
                        onClick={verifyRecord}
                        disabled={!file || status === 'verifying'}
                        className="w-full mt-6 py-4 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {status === 'verifying' ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Verifying on Blockchain...
                            </>
                        ) : (
                            'Verify Authenticity'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
