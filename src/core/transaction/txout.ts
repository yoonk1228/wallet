import { Wallet } from '@core/wallet/wallet'

export class TxOut {
    public account: string
    public amount: number

    constructor(_account: string, _amount: number) {
        this.account = _account
        this.amount = _amount
    }

    // 보내는 사람 계정 받는 사람 계정 dum amount
    static createTxOuts(sum: number, _receivedTx: any): TxOut[] {
        // todo: receivedTx 타입 any 수정
        // _receivedTx.amount // 보낼금액
        // _receivedTx.sender // 공개키
        // _receivedTx.account // 계정
        const { sender, received, amount } = _receivedTx
        const senderAccount: string = Wallet.getAccount(sender)
        // 받는 사람 계정 : amount
        // 보내는 사람 계정 : sum 단, sum-amount 가 0일경우에는 보내는 사람을 만들면 안됨.
        const receivedTxOut = new TxOut(received, amount)
        const senderTxOut = new TxOut(senderAccount, sum - amount)
        if (senderTxOut.amount <= 0) return [receivedTxOut]
        return [receivedTxOut, senderTxOut]
    }
}
