import { WebSocket } from 'ws'
import { Chain } from '@core/blockchain/chain'
import { Block } from '@core/blockchain/block'

enum MessageType {
    latest_block = 0,
    all_block = 1,
    receivedChain = 2,
}

interface Message {
    type: MessageType
    payload: any
}

export class P2PServer extends Chain {
    private readonly sockets: WebSocket[]

    constructor() {
        super()
        this.sockets = []
    }

    getSockets() {
        return this.sockets
    }

    // 서버 시작
    listen() {
        const server = new WebSocket.Server({ port: 7545 })
        // _socket: 클라이언트의 데이타
        server.on('connection', (_socket, req) => {
            const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
            console.log(` websocket connection from client \nip is${ip}`)
            this.connectSocket(_socket)
        })
    }

    // 클라이언트 연결
    connectToPeer(newPeer: string) {
        // socket: 서버의 데이타
        const socket = new WebSocket(newPeer)
        // open : 완벽히 연결 되었을 때
        socket.on('open', () => {
            this.connectSocket(socket)
        })
    }

    // 서버와 클라이언트 모두에서 실행
    connectSocket(_socket: WebSocket) {
        this.sockets.push(_socket)
        this.messageHandler(_socket)

        const data: Message = {
            type: MessageType.latest_block,
            payload: {},
        }
        this.errorHandler(_socket)
        // 메세지 (신호) 보냄
        this.send(_socket)(data)
    }

    // 메세지를 등록
    messageHandler(_socket: WebSocket) {
        const callback = (_data: string) => {
            // console.log(_data)
            const result: Message = P2PServer.dataParse<Message>(_data)
            // console.log(result)
            const send = this.send(_socket)
            switch (result.type) {
                // 서버가 실행
                case MessageType.latest_block: {
                    const message: Message = {
                        type: MessageType.all_block,
                        payload: [this.getLatestBlock()],
                    }
                    send(message)
                    break
                }
                // 클라이언트가 실행
                case MessageType.all_block: {
                    const message: Message = {
                        type: MessageType.receivedChain,
                        payload: this.getChain(),
                    }
                    // todo : 블록 검증 후 블록을 넣을지 말지
                    // 내 블록의 hash 가 상대방 블록의 previoushash 와 같은지
                    const [receivedBlock] = result.payload // server 의 [this.getLatestBlock()]
                    const isValid = this.addToChain(receivedBlock)
                    // addToChain 이 성공 되었을 때는 굳이 요청할 필요 없다.
                    if (!isValid.isError) break
                    send(message)
                    break
                }
                case MessageType.receivedChain: {
                    const receivedChain: IBlock[] = result.payload
                    // const receivedChain: {} = message.payload
                    // console.log(receivedChain)
                    this.handleChainResponse(receivedChain)
                    // todo : 체인 바꿔주기
                    break
                }
            }
        }
        _socket.on('message', callback)
    }

    errorHandler(_socket: WebSocket) {
        const close = () => {
            this.sockets.splice(this.sockets.indexOf(_socket), 1)
        }
        _socket.on('close', close)
        _socket.on('error', close)
    }

    // send 보낼때 JSON.stringify 해줌
    send(_socket: WebSocket) {
        return (_data: Message) => {
            _socket.send(JSON.stringify(_data))
        }
    }

    broadcast(_message: Message) {
        this.sockets.forEach((socket) => this.send(socket)(_message))
    }

    // 체인 검증
    public handleChainResponse(_receivedChain: IBlock[]): Failable<undefined, string> {
        // 전달받은 체인이 일단 올바른가?
        const isValidChain = this.isValidChain(_receivedChain)
        if (isValidChain.isError) return { isError: true, error: isValidChain.error }
        // 내 체인과 상대체인에 대해 검사
        // 1. 받은체인의 최신블록.index < 내체인최신블록.index return
        // 2. 받은체인의 이전해시값 === 내 체인의 해시값
        // 3. 받은체인의 길이가 ===1 (제네시스밖에 없네) return
        // 4. 내 체인이 더 짧다. 다 바꾸자.
        const isVaild = this.replaceChain(_receivedChain)
        if (isVaild.isError) return { isError: true, error: isVaild.error }

        // broadcast
        const message: Message = {
            type: MessageType.receivedChain,
            payload: _receivedChain,
        }
        this.broadcast(message)
        return { isError: false, value: undefined }
    }

    // 데이터 parsing
    public static dataParse<T>(_data: string): T {
        return JSON.parse(Buffer.from(_data).toString())
        // const result = JSON.parse(Buffer.from(_data).toString())
        // if (result.isError) return { isError: true, error: '변환 실패!' }
        // return { isError: false, value: result }
        // try {
        //     return JSON.parse(Buffer.from(_data).toString())
        // } catch (e) {
        //     return null
        // }
    }
}
