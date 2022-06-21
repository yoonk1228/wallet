import { Chain } from '@core/blockchain/chain'
import { Wallet } from '@core/wallet/wallet'

describe('Chain 함수 체크', () => {
    let node: Chain = new Chain()

    it('getChain() 함수 체크', () => {
        console.log(node.getChain())
    })
    it('getLength() 함수 체크', () => {
        console.log(node.getLength())
    })
    it('getLatestBlock() 함수 체크', () => {
        console.log(node.getLatestBlock())
    })
    it('addBlock() 함수 체크', () => {
        // for (let i = 1; i <= 10; i++) {
        //     node.miningBlock('')
        // }
        node.miningBlock('e7916d4d449f22bc65eec91ec01e8f98391f6a31')
        node.miningBlock('e7916d4d449f22bc65eec91ec01e8f98391f6a31')
        node.miningBlock('e7916d4d449f22bc65eec91ec01e8f98391f6a31')
        node.miningBlock('b7916d4d449f22bc65eec91ec01e8f98391f6a45')
        node.miningBlock('b7916d4d449f22bc65eec91ec01e8f98391f6a45')
        node.miningBlock('b7916d4d449f22bc65eec91ec01e8f98391f6a45')
        // console.log(node.getChain())
        // console.log(node.getUnspentTxOuts())
        console.log(
            'b7916d4d449f22bc65eec91ec01e8f98391f6a45 의 총 금액 : ',
            Wallet.getBalance('b7916d4d449f22bc65eec91ec01e8f98391f6a45', node.getUnspentTxOuts()),
        )
    })
})
