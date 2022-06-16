import { Block } from '@core/blockchain/block'
import { DIFFICULTY_ADJUSTMENT_INTERVAL } from '@core/config'

export class Chain {
    public blockchain: Block[]

    constructor() {
        this.blockchain = [Block.getGENESIS()]
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

    public addBlock(_data: string[]): Failable<Block, string> {
        // TODO : 1. 내가 앞으로 생성할 블록의 높이값을 가져올 수 있는가?
        // 현재 높이값 - block interval 햇을때 음수가 나오면, genesisblock 을 보게 만들면 된다.
        // 2. 난이도를 구하기 (difficulty) -> 생성시간이 필요함
        const previousBlock = this.getLatestBlock()
        const adjustmentBlock = this.getAdjustmentBlock() // 높이에 해당하는 block
        const newBlock = Block.generateBlock(previousBlock, _data, adjustmentBlock)
        const isValid = Block.isValidNewBlock(newBlock, previousBlock)

        if (isValid.isError) return { isError: true, error: isValid.error }

        this.blockchain.push(newBlock)
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
