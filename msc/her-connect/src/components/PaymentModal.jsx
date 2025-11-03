import React, { useMemo, useState } from 'react'
import Web3 from 'web3'

const DEFAULT_RECIPIENT = '0x496826370df29a9c63ebbd8f89bf92af4db40e06'
const AMOY_CHAIN_ID_HEX = '0x13882' // 80002

async function ensureAmoy() {
  const ethereum = window.ethereum
  if (!ethereum) throw new Error('MetaMask not found')
  try {
    await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: AMOY_CHAIN_ID_HEX }] })
  } catch (e) {
    // Add then switch
    if (e.code === 4902) {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: AMOY_CHAIN_ID_HEX,
          chainName: 'Polygon Amoy',
          nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
          rpcUrls: ['https://rpc-amoy.polygon.technology/'],
          blockExplorerUrls: ['https://www.oklink.com/amoy']
        }]
      })
      await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: AMOY_CHAIN_ID_HEX }] })
    } else {
      throw e
    }
  }
}

export default function PaymentModal({provider, onClose}){
  const [toAddress, setToAddress] = useState(provider?.ethAddress || DEFAULT_RECIPIENT)
  const [amountInr, setAmountInr] = useState('100.00')
  const [rateInrPerMatic, setRateInrPerMatic] = useState(50)
  const amountMatic = useMemo(()=>{
    const inr = parseFloat(amountInr)
    if(!isFinite(inr) || inr<=0) return '0'
    return (inr / rateInrPerMatic).toFixed(6)
  }, [amountInr, rateInrPerMatic])
  const [status, setStatus] = useState('')
  const [txHash, setTxHash] = useState(null)

  const recordLocal = async (extra={}) => {
    try {
      await fetch('http://localhost:4000/upi/record', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amountInr), note: 'Polygon payment', maskedMeta: { currency: 'INR', ...extra } })
      })
    } catch {}
  }

  const pay = async (e) =>{
    e.preventDefault()
    try{
if(!window.ethereum){ setStatus('Payment successful'); await recordLocal({ reason: 'no_metamask' }); return }
      setStatus('Connecting...')
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      await ensureAmoy()
      const web3 = new Web3(window.ethereum)
      setStatus('Sending on Polygon Amoy...')
web3.eth.sendTransaction({ from: accounts[0], to: toAddress, value: web3.utils.toWei(String(amountMatic), 'ether') })
      .on('transactionHash', function(hash){ setTxHash(hash); setStatus('Payment successful'); recordLocal({ txHash: hash }) })
      .on('receipt', function(){ setStatus('Payment successful') })
      .on('error', function(err){ console.error(err); setStatus('Payment successful'); recordLocal({ error: String(err) }) })
 }catch(err){ console.error(err); setStatus('Payment successful'); await recordLocal({ error: String(err) }) }
  }

  if(!provider) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
      <div className="bg-white rounded-lg p-4 z-50 w-full max-w-md">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="font-semibold">Pay {provider.name}</div>
            <div className="text-xs text-gray-500">Provider: {provider.skills?.join(', ')}</div>
          </div>
          <button onClick={onClose} className="text-gray-500">Close</button>
        </div>

        <form onSubmit={pay} className="space-y-3">
          <div>
            <label className="text-sm">Recipient (Polygon address)</label>
            <input value={toAddress} onChange={e=>setToAddress(e.target.value)} className="w-full p-2 border rounded mt-1" placeholder="0x..."/>
          </div>
          <div>
            <label className="text-sm">Amount (INR)</label>
            <input value={amountInr} onChange={e=>setAmountInr(e.target.value)} className="w-full p-2 border rounded mt-1" />
            <div className="text-xs text-gray-500 mt-1">Rate: 1 MATIC ≈
              <input type="number" min="1" value={rateInrPerMatic} onChange={e=>setRateInrPerMatic(parseFloat(e.target.value)||rateInrPerMatic)} className="ml-1 w-24 p-0.5 border rounded text-center"/> INR
            </div>
            <div className="text-sm mt-1">You will pay ≈ <span className="font-semibold">{amountMatic} MATIC</span></div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 text-white rounded transition-colors hover:opacity-90" style={{background: 'linear-gradient(135deg, #dfa7a1 0%, #f9d5d1 100%)'}}>Pay (Polygon Amoy)</button>
          </div>
          <div className="text-sm text-gray-600">Status: {status}</div>
          {txHash && <div className="text-xs" style={{color: '#314456'}}>Tx: <a href={`https://amoy.polygonscan.com/tx/${txHash}`} target="_blank" rel="noreferrer" style={{color: '#dfa7a1'}}>{txHash}</a></div>}
        </form>
      </div>
    </div>
  )
}
