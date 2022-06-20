import express from 'express'
import nunjucks from 'nunjucks'
import { Wallet } from './wallet'

const app = express()

// axios

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
app.post('/wallet/:account', (req, res) => {
    const { account } = req.params
    console.log('wallet/:account', account)
    const privateKey = Wallet.getWalletPrivateKey(account) // privateKey
    res.json(new Wallet(privateKey))
})

// sendTransaction
app.post('/sendTransaction', (req, res) => {
    console.log(req.body)
    res.json({})
})

app.listen(3005, () => {
    console.log('지갑 서버 시작', 3005)
})
