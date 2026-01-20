"use client";

import { useState, useEffect, useCallback } from "react";

export function useMetaMask() {
    const [account, setAccount] = useState<string | null>(null);
    const [balance, setBalance] = useState<string>("0.00");
    const [isConnecting, setIsConnecting] = useState(false);
    const [lockedAmount, setLockedAmount] = useState<number>(0);

    // Load from local storage for persistence in demo
    useEffect(() => {
        const savedAccount = localStorage.getItem("metamask_account");
        const savedLocked = localStorage.getItem("metamask_locked");
        if (savedAccount) setAccount(savedAccount);
        if (savedLocked) setLockedAmount(Number(savedLocked));
        setBalance("1240.50"); // Mock balance
    }, []);

    const connectWallet = useCallback(async () => {
        setIsConnecting(true);
        // Simulate connection delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const mockAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
        setAccount(mockAddress);
        localStorage.setItem("metamask_account", mockAddress);
        setIsConnecting(false);
    }, []);

    const disconnectWallet = useCallback(() => {
        setAccount(null);
        localStorage.removeItem("metamask_account");
    }, []);

    const lockAmount = useCallback((amount: number) => {
        setLockedAmount((prev) => {
            const newVal = prev + amount;
            localStorage.setItem("metamask_locked", String(newVal));
            return newVal;
        });
    }, []);

    const refundAmount = useCallback((amount: number) => {
        setLockedAmount((prev) => {
            const newVal = Math.max(0, prev - amount);
            localStorage.setItem("metamask_locked", String(newVal));
            return newVal;
        });
    }, []);

    return {
        account,
        balance,
        isConnecting,
        lockedAmount,
        connectWallet,
        disconnectWallet,
        lockAmount,
        refundAmount,
    };
}
