export class TxIn {
    public txOutId: string
    public txOutIndex: number // 코인베이스 일때는 블록의 높이로 설정
    public signature?: string // 서명이 없을 수도 있다.

    constructor(_txOutId: string, _txOutIndex: number, _signature: string | undefined = undefined) {
        this.txOutId = _txOutId
        this.txOutIndex = _txOutIndex
        this.signature = _signature
    }

    static createTxIns(_receivedTx: any, _myUTXO: IUnspentTxOut[]) {
        let sum = 0
        let txIns: TxIn[] = []
        for (let i = 0; i < _myUTXO.length; i++) {
            const { txOutId, txOutIndex, amount } = _myUTXO[i]
            const item: TxIn = new TxIn(txOutId, txOutIndex, _receivedTx.signature)
            txIns.push(item)
            sum += amount
            if (sum >= _receivedTx.amount) return { sum, txIns }
        }
        // for (const utxo of _myUTXO) {}
        return { sum, txIns }
    }
}
