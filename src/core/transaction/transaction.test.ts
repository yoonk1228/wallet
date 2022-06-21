import { TxIn } from './txin'
import { TxOut } from './txout'
import { Transaction } from './transaction'

describe('Transaction 생성', () => {
    // 코인 베이스
    let txin: TxIn
    let txout: TxOut
    let transaction: Transaction
    it('txin 생성해보기', () => {
        txin = new TxIn('', 0)
    })
    it('txout 생성해보기', () => {
        txout = new TxOut('e7916d4d449f22bc65eec91ec01e8f98391f6a31', 50)
    })
    it('트랜잭션 생성해보기', () => {
        transaction = new Transaction([txin], [txout])
        const utxo = transaction.createUTXO()
        console.log(utxo)
    })
})
