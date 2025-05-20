import mitt, { Emitter } from 'mitt'

import {
  IdentifierArray,
  IdentifierString,
  ReadonlyWalletAccount,
  registerWallet,
  StandardConnectFeature,
  StandardConnectMethod,
  StandardDisconnectFeature,
  StandardDisconnectMethod,
  StandardEventsFeature,
  StandardEventsListeners,
  StandardEventsOnMethod,
  SUI_DEVNET_CHAIN,
  SUI_TESTNET_CHAIN,
  SUI_MAINNET_CHAIN,
  SuiSignAndExecuteTransactionBlockFeature,
  SuiSignAndExecuteTransactionBlockMethod,
  SuiSignMessageFeature,
  SuiSignMessageMethod,
  SuiSignTransactionBlockFeature,
  SuiSignTransactionBlockMethod,
  Wallet,
  SuiChain,
} from '@mysten/wallet-standard'

export type WalletInfo = {
  name?: string
  logo: string
}

export type SuiChainType = SuiChain

export interface AccountInfo {
  address: string
  publicKey: Uint8Array
}

type WalletEventsMap = {
  [E in keyof StandardEventsListeners]: Parameters<StandardEventsListeners[E]>[0]
}

type Features = StandardConnectFeature &
  StandardDisconnectFeature &
  StandardEventsFeature &
  SuiSignAndExecuteTransactionBlockFeature &
  SuiSignTransactionBlockFeature &
  SuiSignMessageFeature

enum Feature {
  STANDARD__CONNECT = 'standard:connect',
  STANDARD__DISCONNECT = 'standard:disconnect',
  STANDARD__EVENTS = 'standard:events',
  SUI__SIGN_AND_EXECUTE_TRANSACTION_BLOCK = 'sui:signAndExecuteTransactionBlock',
  SUI__SIGN_TRANSACTION_BLOCK = 'sui:signTransactionBlock',
  SUI__SIGN_MESSAGE = 'sui:signMessage',
}

export class TomoEmbedWallet implements Wallet {
  readonly version = '1.0.0' as const
  readonly _name = 'Tomo Wallet' as const
  readonly provider: any
  public emitter: Emitter<any>

  _account: ReadonlyWalletAccount | null
  _phantom: any
  _windowPhantom: any

  get name() {
    return this._name
  }

  get icon() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDI0MCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNDAiIGhlaWdodD0iMjQwIiByeD0iNDAiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTE0Ljg1MiA0MS40NTk0QzExNy43MDggMzguMTgwMiAxMjIuODAyIDM4LjE4MDIgMTI1LjY1OCA0MS40NTk0TDEzNi4wNSA1My4zOTNDMTM4LjE5MSA1NS44NTI0IDE0MS43MjQgNTYuNTU1IDE0NC42NDMgNTUuMTAyNEwxNTguODExIDQ4LjA1NEMxNjIuNzA0IDQ2LjExNzIgMTY3LjQxMSA0OC4wNjY4IDE2OC43OTQgNTIuMTg5MUwxNzMuODI4IDY3LjE5MTFDMTc0Ljg2NiA3MC4yODI5IDE3Ny44NiA3Mi4yODM4IDE4MS4xMTQgNzIuMDU5MUwxOTYuOSA3MC45NjlDMjAxLjIzOCA3MC42Njk0IDIwNC44NCA3NC4yNzE4IDIwNC41NDEgNzguNjA5N0wyMDMuNDUxIDk0LjM5NjJDMjAzLjIyNiA5Ny42NDk2IDIwNS4yMjcgMTAwLjY0NCAyMDguMzE5IDEwMS42ODJMMjIzLjMyMSAxMDYuNzE2QzIyNy40NDMgMTA4LjA5OSAyMjkuMzkzIDExMi44MDYgMjI3LjQ1NiAxMTYuNjk5TDIyMC40MDcgMTMwLjg2NkMyMTguOTU1IDEzMy43ODYgMjE5LjY1OCAxMzcuMzE4IDIyMi4xMTcgMTM5LjQ2TDIzNC4wNTEgMTQ5Ljg1MkMyMzcuMzMgMTUyLjcwNyAyMzcuMzMgMTU3LjgwMiAyMzQuMDUxIDE2MC42NTdMMjIyLjkxMiAxNzAuMzU3QzIyMC4xMDIgMTcyLjgwNCAyMTkuNjM3IDE3Ni45OTYgMjIxLjg0MiAxNzkuOTk5TDIyOS4wMTcgMTg5Ljc3M0MyMzIuNDkxIDE5NC41MDQgMjI5LjExMiAyMDEuMTc3IDIyMy4yNDIgMjAxLjE3N0gyMDMuMDY5SDE2Ny4zMDVDMTg1LjYxNiAxOTQuNTkzIDE5NC4wNDEgMTczLjQxNSAxODUuMTkgMTU2LjAzMUMxNzUuNTE4IDEzNy4wMzQgMTUwLjQ0MiAxMzIuNDEyIDEzNC42MzEgMTQ2LjcxTDEzMy42NDYgMTQ3LjYwMUMxMjYuMDE3IDE1NC41MDEgMTE0LjQwMiAxNTQuNTAxIDEwNi43NzMgMTQ3LjYwMUwxMDUuNzg4IDE0Ni43MUM4OS45Nzc3IDEzMi40MTIgNjQuOTAxNyAxMzcuMDM0IDU1LjIyOTEgMTU2LjAzMUM0Ni4zNzggMTczLjQxNSA1NC44MDMzIDE5NC41OTMgNzMuMTE0MyAyMDEuMTc3SDM3LjQ0MDZIMTcuMjY3OEMxMS4zOTc5IDIwMS4xNzcgOC4wMTkwNiAxOTQuNTA0IDExLjQ5MjcgMTg5Ljc3M0wxOC42Njc5IDE3OS45OTlDMjAuODcyOCAxNzYuOTk2IDIwLjQwNzUgMTcyLjgwNCAxNy41OTc3IDE3MC4zNTdMNi40NTkzOCAxNjAuNjU3QzMuMTgwMjEgMTU3LjgwMiAzLjE4MDIxIDE1Mi43MDcgNi40NTkzOCAxNDkuODUyTDE4LjM5MjkgMTM5LjQ2QzIwLjg1MjMgMTM3LjMxOCAyMS41NTUgMTMzLjc4NiAyMC4xMDI0IDEzMC44NjZMMTMuMDU0IDExNi42OTlDMTEuMTE3MiAxMTIuODA2IDEzLjA2NjggMTA4LjA5OSAxNy4xODkxIDEwNi43MTZMMzIuMTkxMSAxMDEuNjgyQzM1LjI4MjkgMTAwLjY0NCAzNy4yODM4IDk3LjY0OTYgMzcuMDU5MSA5NC4zOTYyTDM1Ljk2OSA3OC42MDk3QzM1LjY2OTQgNzQuMjcxOCAzOS4yNzE4IDcwLjY2OTQgNDMuNjA5NyA3MC45NjlMNTkuMzk2MiA3Mi4wNTkxQzYyLjY0OTYgNzIuMjgzOCA2NS42NDQyIDcwLjI4MjkgNjYuNjgxNyA2Ny4xOTExTDcxLjcxNTcgNTIuMTg5MUM3My4wOTkgNDguMDY2OCA3Ny44MDU4IDQ2LjExNzIgODEuNjk4OCA0OC4wNTRMOTUuODY2NCA1NS4xMDI0Qzk4Ljc4NjIgNTYuNTU1IDEwMi4zMTkgNTUuODUyNCAxMDQuNDYgNTMuMzkzTDExNC44NTIgNDEuNDU5NFpNMTIwLjk0NCAxOTkuNDgyQzEyOS41OTggMTk5LjQ4MiAxMzYuNjE0IDE5NC45NTQgMTM2LjYxNCAxODkuMzY4QzEzNi42MTQgMTgzLjc4MiAxMjkuNTk4IDE3OS4yNTQgMTIwLjk0NCAxNzkuMjU0QzExMi4yOSAxNzkuMjU0IDEwNS4yNzUgMTgzLjc4MiAxMDUuMjc1IDE4OS4zNjhDMTA1LjI3NSAxOTQuOTU0IDExMi4yOSAxOTkuNDgyIDEyMC45NDQgMTk5LjQ4MlpNOTIuNjA4NyAxNjkuOTQzQzkyLjYwODcgMTc1LjEgODguNDI4NCAxNzkuMjggODMuMjcxNyAxNzkuMjhDNzguMTE1MSAxNzkuMjggNzMuOTM0OCAxNzUuMSA3My45MzQ4IDE2OS45NDNDNzMuOTM0OCAxNjQuNzg2IDc4LjExNTEgMTYwLjYwNiA4My4yNzE3IDE2MC42MDZDODguNDI4NCAxNjAuNjA2IDkyLjYwODcgMTY0Ljc4NiA5Mi42MDg3IDE2OS45NDNaTTE1OC42MzIgMTc5LjI4QzE2My43ODggMTc5LjI4IDE2Ny45NjkgMTc1LjEgMTY3Ljk2OSAxNjkuOTQzQzE2Ny45NjkgMTY0Ljc4NiAxNjMuNzg4IDE2MC42MDYgMTU4LjYzMiAxNjAuNjA2QzE1My40NzUgMTYwLjYwNiAxNDkuMjk1IDE2NC43ODYgMTQ5LjI5NSAxNjkuOTQzQzE0OS4yOTUgMTc1LjEgMTUzLjQ3NSAxNzkuMjggMTU4LjYzMiAxNzkuMjhaIiBmaWxsPSIjRkUzQzlDIi8+Cjwvc3ZnPgo=' as any
  }

  get chains() {
    return [SUI_MAINNET_CHAIN] as IdentifierArray
  }

  get accounts() {
    return this._account ? [this._account] : []
  }

  get features(): Features {
    return {
      [Feature.STANDARD__CONNECT]: {
        version: '1.0.0',
        connect: this.$connect,
      },
      [Feature.STANDARD__DISCONNECT]: {
        version: '1.0.0',
        disconnect: this.$disconnect,
      },
      [Feature.STANDARD__EVENTS]: {
        version: '1.0.0',
        on: this.$on,
      },
      [Feature.SUI__SIGN_AND_EXECUTE_TRANSACTION_BLOCK]: {
        version: '1.0.0',
        signAndExecuteTransactionBlock: this.$signAndExecuteTransactionBlock,
      },
      [Feature.SUI__SIGN_TRANSACTION_BLOCK]: {
        version: '1.0.0',
        signTransactionBlock: this.$signTransactionBlock,
      },
      [Feature.SUI__SIGN_MESSAGE]: {
        version: '1.0.0',
        signMessage: this.$signMessage,
      },
    }
  }

  constructor(provider: any) {
    this.provider = provider
    this._account = null
    this.emitter = mitt()
    this.subscribeEventFromBackend()
    // void this.$connected();
  }

  $on: StandardEventsOnMethod = (event, listener) => {
    this.emitter.on(event, listener)
    return () => {
      this.emitter.off(event, listener)
    }
  }

  $connected = async () => {
    let account: AccountInfo | null = null
    try {
      if (this.provider.accounts) {
        account = this.provider.accounts[0]
      } else {
        const address = await this.provider.getAddress()
        account = {
          address,
          publicKey: new Uint8Array(),
        }
      }
    } catch (e) {
      console.error(e)
      return {
        accounts: [],
      }
    }

    if (!account) {
      return { accounts: this.accounts }
    }

    const activateAccount = this._account
    if (activateAccount && activateAccount.address === account.address) {
      return { accounts: this.accounts }
    }

    if (account) {
      await this.handleAccountSwitch(account)

      return { accounts: this.accounts }
    }
  }

  $connect: StandardConnectMethod = async (input) => {
    await this.$connected()

    return { accounts: this.accounts }
  }

  $disconnect: StandardDisconnectMethod = async () => {
    // await this.provider.disconnect();
    this._account = null
    this.emitter.emit('disconnect')
  }

  getActiveChain() {
    return [SUI_MAINNET_CHAIN]
  }

  $signAndExecuteTransactionBlock: SuiSignAndExecuteTransactionBlockMethod = async (input) => {
    return this.provider.signAndExecuteTransaction(input)
  }

  $signTransactionBlock: SuiSignTransactionBlockMethod = async (input) => {
    const res = await this.provider.signTransaction({
      ...input,
      transaction: input.transactionBlock,
    })
    if (!res.signature) {
      throw new Error('Transaction cancelled')
    }
    return {
      ...res,
      transactionBlockBytes: res.bytes,
      bytes: res.bytes,
    }
  }

  $signMessage: SuiSignMessageMethod = async (input) => {
    return await this.provider.signMessage(input)
  }

  subscribeEventFromBackend() {
    this.emitter.on('accountChanged', (account: AccountInfo) => {
      if (!account) {
        return
      }
      void this.handleAccountSwitch(account)
    })
  }

  handleAccountSwitch = async (payload: AccountInfo) => {
    const { address, publicKey } = payload

    this._account = new ReadonlyWalletAccount({
      address: address,
      publicKey: publicKey,
      chains: [SUI_MAINNET_CHAIN],
      features: [
        Feature.STANDARD__CONNECT,
        Feature.SUI__SIGN_AND_EXECUTE_TRANSACTION_BLOCK,
        Feature.SUI__SIGN_TRANSACTION_BLOCK,
        Feature.SUI__SIGN_MESSAGE,
      ],
    })

    this.emitter.emit('change', {
      accounts: this.accounts,
      chains: [SUI_MAINNET_CHAIN],
    })
  }

  handleNetworkSwitch = (payload: { network: string }) => {
    const { network } = payload

    this.emitter.emit('change', {
      accounts: this.accounts,
      chains: [network as IdentifierString],
    })
  }
}
