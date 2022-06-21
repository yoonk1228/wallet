// 웹 서버에서 wallet 검증의 용도
import elliptic from 'elliptic'
import { SHA256 } from 'crypto-js'

const ec = new elliptic.ec('secp256k1')

export type Signature = elliptic.ec.Signature

export interface ReceivedTx {
    sender: string
    received: string
    amount: number
    signature: Signature
}

export class Wallet {
    public publicKey: string
    public account: string
    public balance: number
    public signature: Signature

    constructor(_sender: string, _signature: Signature) {
        this.publicKey = _sender
        this.account = this.getAccount()
        this.balance = 0
        this.signature = _signature
    }

    // try catch 안에서 사용
    public static sendTransaction(_receivedTx: ReceivedTx) {
        // todo: 서명 검증
        // 1. 공개키, 받는사람:계정, 보낼금액 (_receivedTx)
        const verify = Wallet.getVerify(_receivedTx)
        if (verify.isError) throw new Error(verify.error)

        console.log(verify.isError)
        // todo: 보내는 사람의 지갑정보 최신화
        const myWallet = new this(_receivedTx.sender, _receivedTx.signature)

        // todo: 최신화를 가지고 balance 체크
        // todo: Transaction 을 만드는 과정
    }

    public static getVerify(_receivedTx: ReceivedTx): Failable<undefined, string> {
        const hash: string = SHA256([_receivedTx.sender, _receivedTx.received, _receivedTx.amount].join('')).toString()

        // todo : 타원곡선 알고리즘 사용 (검증해야되니까)
        const keyPair = ec.keyFromPublic(_receivedTx.sender, 'hex')
        const isVerify = keyPair.verify(hash, _receivedTx.signature)
        console.log('검증 결과', isVerify)
        if (!isVerify) return { isError: true, error: '서명이 올바르지 않습니다.' } // 서명 내용이 바뀌었다

        return { isError: false, value: undefined }
    }

    public getAccount(): string {
        return Buffer.from(this.publicKey).slice(26).toString()
    }

    // account, unspentTxOut[]
    public static getBalance(_account: string, _UnspentTxOuts: IUnspentTxOut[]): number {
        return _UnspentTxOuts
            .filter((v) => {
                return v.account === _account
            })
            .reduce((acc, utxo) => {
                return (acc += utxo.amount)
            }, 0)
    }
}
