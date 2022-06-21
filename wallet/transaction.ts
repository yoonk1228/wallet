// 비트코인
interface ITxIn {
    // txOutId: string
    // txOutIndex: number
    // signature?: any
    // 보내는 사람
    // 보내는 금액
    // 보내는 사람의 서명
}
interface ITxOut {
    address: string // 받는 사람
    amount: number // 받을 양
}
interface ITransaction {
    hash: string
    txins: ITxIn[]
    txouts: ITxOut[]
}
interface UnspentTxOut {
    txOutdId: string
    txOutindex: number
    account: string
    amount: number
}
