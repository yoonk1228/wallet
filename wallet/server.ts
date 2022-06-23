import express from 'express'
import nunjucks from 'nunjucks'
import { Wallet } from './wallet'
import axios from 'axios'

const app = express()

const userid = process.env.USERID || 'web7722'
const userpw = process.env.USERPW || '1234'
const baseurl = process.env.BASEURL || 'http:/localhost:3000'

const baseAuth = Buffer.from(userid + ':' + userpw).toString('base64')

const request = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
        Authorization: 'Basic ' + baseAuth,
        'Content-type': 'application/json',
    },
})

app.use(express.json())
app.set('view engine', 'html')
nunjucks.configure('views', {
    express: app,
    watch: true,
})

app.get('/', (req, res) => {
    res.render('index', { data: new Wallet() })
})

app.post('/newWallet', (req, res) => {
    res.json(new Wallet())
})

// list
app.post('/walletList', (req, res) => {
    console.log('wallet list')
    const list = Wallet.getWalletList() // string
    res.json(list)
})

// view
app.get('/wallet/:account', async (req, res) => {
    const { account } = req.params
    // console.log(account)
    const privateKey = Wallet.getWalletPrivateKey(account) // private Key
    const myWallet = new Wallet(privateKey)

    const response = await request.post('/getBalance', { account })
    console.log(response.data.balance)
    myWallet.balance = response.data.balance
    res.json(myWallet)
})

// sendTransaction
app.post('/sendTransaction', async (req, res) => {
    console.log('req.body :', req.body)
    const {
        sender: { account, publicKey },
        received,
        amount,
    } = req.body
    // 서명 만들떄 필요한값 : 공개키 + 계정 + 보낼양
    const signature = Wallet.createSign(req.body)
    // 보낼사람: 공개키, 받는사람: 계정, 보낼양, 서명
    const txObject = {
        sender: publicKey,
        received,
        amount,
        signature,
    }
    console.log('txObject: ', txObject)
    const response = await request.post('/sendTransaction', txObject)
    console.log('localhost:3000/sendTransaction', response.data)

    res.json({})
})

app.listen(3005, () => {
    console.log('지갑 서버 시작', 3005)
})
