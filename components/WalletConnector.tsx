import { useWallet } from '@/lib/hooks/use-wallet'

export function WalletConnector() {
  const { 
    account, 
    availableWallets,
    connecting,
    connectWallet,
    disconnectWallet 
  } = useWallet()

  return (
    <div className="flex items-center space-x-4">
      {account ? (
        <>
          <span className="text-sm">
            {account.address.slice(0, 6)}...{account.address.slice(-4)}
          </span>
          <button
            onClick={disconnectWallet}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            disabled={connecting}
          >
            断开连接
          </button>
        </>
      ) : (
        <div className="flex flex-col gap-2">
          {availableWallets.length > 0 ? (
            availableWallets.map(wallet => (
              <button
                key={wallet.id}
                onClick={() => connectWallet(wallet)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                disabled={connecting}
              >
                连接 {wallet.name}
              </button>
            ))
          ) : (
            <button
              onClick={() => connectWallet()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              disabled={connecting}
            >
              {connecting ? '连接中...' : '连接钱包'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}