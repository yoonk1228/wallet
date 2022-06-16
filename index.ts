import { BlockChain } from '@core/index'
import { P2PServer } from './src/serve/p2p'
import express from 'express'

const app = express()
const bc = new BlockChain()
const ws = new P2PServer()

app.use(express.json())

app.get('/', (req, res) => {
    res.send('hellO?')
})

// 블록 내용
app.get('/chains', (req, res) => {
    res.json(ws.getChain())
})
// 블록 채굴
app.post('/mineBlock', (req, res) => {
    const { data } = req.body
    const newBlock = ws.addBlock(data)
    if (newBlock.isError) return res.status(500).json(newBlock.error)
    res.json(newBlock.value)
})
// ws
app.post('/addToPeer', (req, res) => {
    const { peer } = req.body
    console.log(peer)
    ws.connectToPeer(peer)
})
// peer 확인
app.get('/peers', (req, res) => {
    const sockets = ws.getSockets().map((s: any) => s._socket.remoteAddress + ':' + s._socket.remotePort)
    res.json(sockets)
})
app.listen(3000, () => {
    console.log('서버시작 3000')
    ws.listen()
})
