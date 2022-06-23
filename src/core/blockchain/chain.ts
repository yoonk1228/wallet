import { Block } from '@core/blockchain/block'
import { DIFFICULTY_ADJUSTMENT_INTERVAL } from '@core/config'
import { TxIn } from '@core/transaction/txin'
import { Transaction } from '@core/transaction/transaction'
import { TxOut } from '@core/transaction/txout'
import { unspentTxOut } from '@core/transaction/unspentTxOut'

export class Chain {
    private blockchain: Block[]
    private unspentTxOuts: unspentTxOut[]
    private transactionPool: ITransaction[]

    constructor() {
        this.blockchain = [Block.getGENESIS()]
        this.unspentTxOuts = []
        this.transactionPool = []
    }

    public getUnspentTxOuts(): unspentTxOut[] {
        return this.unspentTxOuts
    }

    public appendUTXO(utxo: unspentTxOut[]) {
        this.unspentTxOuts.push(...utxo)
    }

    public getChain(): Block[] {
        return this.blockchain
    }

    public getLength(): number {
        return this.blockchain.length
    }

    public getLatestBlock(): Block {
        return this.blockchain[this.blockchain.length - 1]
    }

    public getTransactionPool(): ITransaction[] {
        return this.transactionPool
    }

    public appendTransactionPool(_Transaction: ITransaction): void {
        this.transactionPool.push(_Transaction)
    }

    public updateTransactionPool(_newBlock: IBlock): void {
        //상태만 변하는 코드라 리턴값은 없어서 :void
        let txPool: ITransaction[] = this.getTransactionPool()
        _newBlock.data.forEach((tx: ITransaction) => {
            txPool = txPool.filter((txp) => {
                return txp.hash !== tx.hash
            })
        })

        this.transactionPool = txPool
    }

    public miningBlock(_account: string): Failable<Block, string> {
        // todo: Transaction 만두는 코드 넣고, addBock
        const txIn: ITxIn = new TxIn('', this.getLatestBlock().height + 1)
        const txOut: ITxOut = new TxOut(_account, 50)
        const transaction: Transaction = new Transaction([txIn], [txOut])
        const utxo = transaction.createUTXO()
        this.appendUTXO(utxo)
        return this.addBlock([transaction, ...this.getTransactionPool()])
    }

    public addBlock(_data: ITransaction[]): Failable<Block, string> {
        // TODO : 1. 내가 앞으로 생성할 블록의 높이값을 가져올 수 있는가?
        // 현재 높이값 - block interval 햇을때 음수가 나오면, genesis block 을 보게 만들면 된다.
        // 2. 난이도를 구하기 (difficulty) -> 생성시간이 필요함
        const previousBlock = this.getLatestBlock()
        const adjustmentBlock = this.getAdjustmentBlock() // 높이에 해당하는 block
        const newBlock = Block.generateBlock(previousBlock, _data, adjustmentBlock)
        const isValid = Block.isValidNewBlock(newBlock, previousBlock)

        if (isValid.isError) return { isError: true, error: isValid.error }

        this.blockchain.push(newBlock)
        // block.data.transactions
        // transactionPool
        // updateTransactionPool()
        this.updateTransactionPool(newBlock)
        return { isError: false, value: newBlock }
    }

    public addToChain(_receivedBlock: Block): Failable<undefined, string> {
        const isValid = Block.isValidNewBlock(_receivedBlock, this.getLatestBlock())
        console.log('fff', _receivedBlock)
        console.log('ggg', this.getLatestBlock())
        if (isValid.isError) {
            console.log('안됨;')
            console.log(isValid.error)
            return { isError: true, error: isValid.error }
        }
        console.log('됨')
        this.blockchain.push(_receivedBlock)
        _receivedBlock.data.forEach((tx) => {
            this.updateUTXO(tx)
        })
        this.updateTransactionPool(_receivedBlock)
        return { isError: false, value: undefined }
    }

    public isValidChain(_chain: Block[]): Failable<undefined, string> {
        // todo: 제네시스 블럭을 검사하는 코드가 들어간다.
        const genesis = _chain[0]
        // todo: 나머지 체인에 대한 코드부분
        for (let i = 1; i < _chain.length; i++) {
            const newBlock = _chain[i]
            const previousBlock = _chain[i - 1]
            const isValid = Block.isValidNewBlock(newBlock, previousBlock)
            if (isValid.isError) return { isError: true, error: isValid.error }
        }
        return { isError: false, value: undefined }
    }

    updateUTXO(tx: ITransaction): void {
        const unspentTxOuts: unspentTxOut[] = this.getUnspentTxOuts()

        const newUnspentTxOuts = tx.txOuts.map((txOut, i) => {
            return new unspentTxOut(tx.hash, i, txOut.account, txOut.amount)
        })
        // unspentTxOuts
        this.unspentTxOuts = unspentTxOuts
            .filter((utxo: unspentTxOut) => {
                const bool = tx.txIns.find((_v) => {
                    return _v.txOutId === _v.txOutId && _v.txOutIndex === _v.txOutIndex
                })
                // !undefined -> return true(bool)
                return !bool // 없는 거만 true, 있는거만 false
            })
            .concat(newUnspentTxOuts)

        // this.appendTransactionPool(tx)
    }

    replaceChain(_receivedChain: Block[]): Failable<undefined, string> {
        // 내 체인과 상대체인에 대해 검사
        // 2. 받은체인의 이전해시값 === 내 체인의 해시값
        // 3. 받은체인의 길이가 ===1 (제네시스밖에 없네) return
        // 4. 내 체인이 더 짧다. 다 바꾸자.
        const latestReceivedBlock: Block = _receivedChain[_receivedChain.length - 1]
        const latestBlock: Block = this.getLatestBlock()

        // 1. 받은체인의 최신블록.index < 내체인최신블록.index return
        if (latestReceivedBlock.height === 0) {
            return { isError: true, error: '받은 최신블록이 제네시스 블록입니다.' }
        }
        if (latestReceivedBlock.height <= latestBlock.height) {
            return { isError: true, error: '자신의 블록이 길거나 같습니다.' }
        }
        if (latestReceivedBlock.previousHash === latestBlock.hash) {
            // addToChain()
            return { isError: true, error: '블록이 하나만큼 모자릅니다.' }
        }

        // 체인을 바꿔주는 코드를 작성하면됨.
        this.blockchain = _receivedChain

        // UTXO
        // POOL
        this.blockchain.forEach((_block: IBlock) => {
            this.updateTransactionPool(_block)
            _block.data.forEach((_tx) => {
                this.updateUTXO(_tx)
            })
        })
        return { isError: false, value: undefined }
    }
    /*
        생성기준으로 블럭높이가 -10 구해오기
    */
    public getAdjustmentBlock() {
        // 현재 마지막블럭에서 -10 (DIFFICULTY_ADJUSTMENT_INTERVAL)
        const currentLength = this.getLength()
        const adjustmentBlock: Block =
            this.getLength() < DIFFICULTY_ADJUSTMENT_INTERVAL
                ? Block.getGENESIS()
                : this.blockchain[currentLength - DIFFICULTY_ADJUSTMENT_INTERVAL]
        return adjustmentBlock // 높이에 해당하는 블럭
    }
}
