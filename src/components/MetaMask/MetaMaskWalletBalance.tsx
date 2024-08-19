import {useWalletStore} from "@/stores/walletStore";
import {ethers} from "ethers";
import {useEffect, useState} from "react";
import {MOVE_FEE} from "@/lib/constants";

export default function MetaMaskWalletBalance () {
    const address = useWalletStore(state => state.address);
    const [balance, setBalance] = useState<string>("0")

    useEffect(() => {
        (async () => {
            if (!address) return

            const provider = new ethers.BrowserProvider(window.ethereum);
            const balance = await provider.getBalance(address);

            setBalance(ethers.formatEther(balance).toString())

            provider.on('block', async (blockNumber) => {
                const balance = await provider.getBalance(address);

                setBalance(ethers.formatEther(balance).toString())
            })
        })()
    }, [])


    return (
        <div>
            <h3>BALANCES</h3>
            <p>{parseFloat(balance).toFixed(3)}ETH ({Math.floor(balance/MOVE_FEE)} PLAYS)</p>
        </div>
    )
}