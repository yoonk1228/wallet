import { TxIn } from './txin'
import { TxOut } from './txout'
import { SHA256 } from 'crypto-js'
import { unspentTxOut } from '@core/transaction/unspentTxOut'

export class Transaction {
    public hash: string
    public txIns: TxIn[]
    public txOuts: TxOut[]

    constructor(_txIn: TxIn[], _txOuts: TxOut[]) {
        this.txIns = _txIn
        this.txOuts = _txOuts
        this.hash = this.createTransactionHash()
    }

    createTransactionHash(): string {
        const txoutContent: string = this.txOuts.map((v) => Object.values(v).join('')).join('')
        const txinContent: string = this.txIns.map((v) => Object.values(v).join('')).join('')
        console.log(txoutContent, txinContent)
        return SHA256(txoutContent + txinContent).toString()
    }

    createUTXO(): unspentTxOut[] {
        return this.txOuts.map((_txout: TxOut, i: number) => {
            return new unspentTxOut(this.hash, i, _txout.account, _txout.amount)
        })
    }
}
