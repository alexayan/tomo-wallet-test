import { useTomo } from '@tomo-inc/tomo-web-sdk'
import { useEffect } from 'react'
import { TomoEmbedWallet } from '@/services/wallets/tomo'
import { useConnectWallet } from '@mysten/dapp-kit'

export const useTomoEmbedWallet = () => {
  const { mutate: connect } = useConnectWallet()

  const tomo = useTomo()

  useEffect(() => {
    if (!tomo.providers.suiProvider) {
      return
    }
    const wallet = new TomoEmbedWallet(tomo.providers.suiProvider)
    wallet.$on('change', () => {
      tomo?.closeConnectModal()
    })
    wallet?.emitter?.on('disconnect', () => {
      tomo.disconnect()
    })
    setTimeout(() => {
      connect({
        wallet: wallet as any,
      })
    }, 0)
  }, [tomo.providers.suiProvider])

  useEffect(() => {
    // @ts-ignore
    window.openTomoConnectModal = tomo?.openConnectModal
  }, [])
}
