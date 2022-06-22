import { Chain } from '@core/blockchain/chain'
import { Wallet } from '@core/wallet/wallet'

describe('Chain 함수 체크', () => {
    let ws: Chain = new Chain()
    let receivedTx = {
        sender: '030223f0599ed4e9d32367bd4e399dc0ff645d326ea37334c96a465f69644d3e43',
        received: '399dc0ff645d326ea37334c96a465f69644d3e43',
        amount: 30,
        signature: {
            r: 'a486cc4c9694de1a2ae32dc3b31c12d1c26b3f97313f9eda486d24089e8ef9e8',
            s: '9fc39dd293c2096086582539c47497d399b3ed6c0b504d2f07d615163210e1ca',
            recoveryParam: 1,
        },
    }
    it('getChain() 함수 체크', () => {
        console.log(ws.getChain())
    })
    it('getLength() 함수 체크', () => {
        console.log(ws.getLength())
    })
    it('getLatestBlock() 함수 체크', () => {
        console.log(ws.getLatestBlock())
    })
    it('addBlock() 함수 체크', () => {
        // for (let i = 1; i <= 10; i++) {
        //     ws.miningBlock('')
        // }
        ws.miningBlock('399dc0ff645d326ea37334c96a465f69644d3e43')
        // ws.miningBlock('399dc0ff645d326ea37334c96a465f69644d3e43')
        // ws.miningBlock('399dc0ff645d326ea37334c96a465f69644d3e43')
        // ws.miningBlock('b7916d4d449f22bc65eec91ec01e8f98391f6a45')
        // ws.miningBlock('b7916d4d449f22bc65eec91ec01e8f98391f6a45')
        // ws.miningBlock('b7916d4d449f22bc65eec91ec01e8f98391f6a45')
        // console.log(ws.getChain())
        // console.log(ws.getUnspentTxOuts())
        console.log(
            '399dc0ff645d326ea37334c96a465f69644d3e43 의 총 금액 : ',
            Wallet.getBalance('399dc0ff645d326ea37334c96a465f69644d3e43', ws.getUnspentTxOuts()),
        )
    })
    it('sendTransaction 검증', () => {
        console.log('트랜잭션 검증?')
        try {
            const tx = Wallet.sendTransaction(receivedTx, ws.getUnspentTxOuts())
            ws.updateUTXO(tx)
            // Transaction 내용 가지고 UTXO 를 최신화 하기. updateUTXO
        } catch (e) {
            if (e instanceof Error) console.log(e.message)
        }
    })
    it('트랜잭션 검증', () => {
        // todo: 지갑 -> Block Server
        // 서명을 확인하고 받은 것을 가지고
        // utxo 의 내용에 현재 보내는사람의 계정에 돈이 있는지 확인.
        // 이후 Transaction 을 만들어야 한다.
        // 1. 보내는 사람의 금액에 맞는 utxo 를 찾는 과정이 필요.
        // 2. TxIn 을 만드는 과정
        //      보낸 금액 : 1Btc
        // 3. TXOut 만드는 과정
        //      보낼 계정 : asdfasdf
        //      보낼 금액 : 0.5
        //      인구
        //      보낼 계정 : 인구 - 보내는 사람의 계정
        //      보낼금액 : 0.5 - 보낸금액 - 보낼양
        // Transaction 이 발동 되려면 뭐가 필요한가?
        // 지갑 - sendTransaction()
    })
})
