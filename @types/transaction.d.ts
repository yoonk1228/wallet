declare interface ITxOut {
    account: string
    amount: number
}
declare interface ITxIn {
    txOutId: string
    txOutIndex: number
    signature?: string | undefined
}
declare interface ITransaction {
    txIns: ITxIn[]
    txOuts: ITxOut[]
    hash: string
}
declare interface IUnspentTxOut {
    txOutId: string
    txOutIndex: number
    account: string
    amount: number
}
