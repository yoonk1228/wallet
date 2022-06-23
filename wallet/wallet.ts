import { randomBytes } from 'crypto'
import elliptic from 'elliptic'
import fs from 'fs'
import path from 'path'
import { SHA256 } from 'crypto-js'

const dir = path.join(__dirname, '../data')

const ec = new elliptic.ec('secp256k1')

export class Wallet {
    public account: string
    public privateKey: string
    public publicKey: string
    public balance: number

    constructor(_privateKey: string = '') {
        // this.privateKey = _privateKey
        this.privateKey = _privateKey || this.getPrivateKey()
        // this.privateKey = this.getPrivateKey()
        this.publicKey = this.getPublicKey()
        this.account = this.getAccount()
        this.balance = 0

        Wallet.createWallet(this)
    }

    public static createWallet(_myWallet: Wallet) {
        const filename = path.join(dir, _myWallet.account)
        const filecontent = _myWallet.privateKey
        // 파일명 : account
        // 내용 : privateKey
        fs.writeFileSync(filename, filecontent)
    }

    public static getWalletList(): string[] {
        const files: string[] = fs.readdirSync(dir)
        return files
    }

    public static createSign(_obj: any) {
        const {
            sender: { account, publicKey },
            received,
            amount,
        } = _obj
        console.log('과연?', [publicKey, received, amount])
        // hash
        const hash: string = SHA256([publicKey, received, amount].join('')).toString()
        console.log('해시값은??', hash)

        // privateKey
        const privateKey: string = Wallet.getWalletPrivateKey(account)

        const keyPair: elliptic.ec.KeyPair = ec.keyFromPrivate(privateKey)
        return keyPair.sign(hash, 'hex')
    }

    public static getWalletPrivateKey(_account: string): string {
        const filepath = path.join(dir, _account)
        const filecontent = fs.readFileSync(filepath)
        console.log('fileContent:', filecontent.toString())
        return filecontent.toString()
    }

    public getPrivateKey(): string {
        return randomBytes(32).toString('hex')
    }

    public getPublicKey(): string {
        const keyPair = ec.keyFromPrivate(this.privateKey)
        return keyPair.getPublic().encode('hex', true)
    }

    public getAccount(): string {
        return Buffer.from(this.publicKey).slice(26).toString()
    }
}
