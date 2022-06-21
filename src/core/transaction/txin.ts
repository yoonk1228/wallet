export class TxIn {
    public txOutId: string
    public txOutIndex: number // 코인베이스 일때는 블록의 높이로 설정
    public signature?: string // 서명이 없을 수도 있다.

    constructor(_txOutId: string, _txOutIndex: number, _signature: string | undefined = undefined) {
        this.txOutId = _txOutId
        this.txOutIndex = _txOutIndex
        this.signature = _signature
    }
}
