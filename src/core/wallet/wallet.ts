// 웹 서버에서 wallet 검증의 용도
import elliptic from 'elliptic'
import { SHA256 } from 'crypto-js'
import { unspentTxOut } from '@core/transaction/unspentTxOut'
import { Transaction } from '@core/transaction/transaction'

const ec = new elliptic.ec('secp256k1')

export type Signature = elliptic.ec.SignatureOptions
// export type Signature = elliptic.ec.Signature
// import BN = require('bn.js')
// export type Signature = {
//     r: string
//     s: string
//     recoveryParam: number | null
// }

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

    constructor(_sender: string, _signature: Signature, _unspentTxOuts: unspentTxOut[]) {
        this.publicKey = _sender
        this.account = Wallet.getAccount(this.publicKey)
        this.balance = Wallet.getBalance(this.account, _unspentTxOuts)
        this.signature = _signature
    }

    // try catch 안에서 사용, 블록체인이 지갑에게서 Transaction 을 받기 시작한 지점
    public static sendTransaction(_receivedTx: ReceivedTx, _unspentTxOuts: unspentTxOut[]): Transaction {
        // todo: 서명 검증
        // 1. 공개키, 받는사람:계정, 보낼금액 (_receivedTx)
        // todo: verify 검증오류 해결
        // const verify = Wallet.getVerify(_receivedTx)
        // if (verify.isError) throw new Error(verify.error)
        //
        // console.log(verify.isError)

        // 보내는 사람의 지갑정보 최신화
        const myWallet = new this(_receivedTx.sender, _receivedTx.signature, _unspentTxOuts)
        // 최신화를 가지고 balance 체크
        console.log('myWallet', myWallet)
        // console.log('발란스 :', myWallet.balance)
        // console.log('amount :', _receivedTx.amount)
        if (myWallet.balance < _receivedTx.amount) throw new Error('잔액이 모자랍니다')
        // todo: Transaction 을 만드는 과정
        const myUTXO: unspentTxOut[] = unspentTxOut.getMyUnspentTxOuts(myWallet.account, _unspentTxOuts)
        console.log('sendTransaction 할때 myUTXO', myUTXO)
        return Transaction.createTransaction(_receivedTx, myUTXO)
    }

    public static getVerify(_receivedTx: ReceivedTx): Failable<undefined, string> {
        const { sender, received, amount, signature } = _receivedTx
        const data: any[] = [sender, received, amount]
        const hash: string = SHA256(data.join('')).toString()
        // todo : 타원곡선 알고리즘 사용 (검증해야되니까)
        const keyPair = ec.keyFromPublic(sender, 'hex')
        const isVerify = keyPair.verify(hash, signature)
        console.log('검증 결과', isVerify)
        if (!isVerify) return { isError: true, error: '서명이 올바르지 않습니다.' } // 서명 내용이 바뀌었다

        return { isError: false, value: undefined }
    }

    public static getAccount(_publicKey: string): string {
        return Buffer.from(_publicKey).slice(26).toString()
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
