import { SHA256 } from 'crypto-js'
import { Output, Input } from './generic'

describe('class Output 검증', () => {
    let output: Output
    let input: Input
    it('Output 인스턴스 생성 확인', () => {
        output = new Output('7722', 10)
        console.log(output)
    })
    it('Input 인스턴스 생성 확인', () => {
        input = new Input(output)
        console.log(input)
    })
    it('txToString() 구현', () => {
        function txToString<Type>(put: Type) {
            const result = Object.entries(put)
            const a = result.map((v) => {
                return v.join('')
            })
            console.log(a)
            return a.join('')
        }

        const inputResult = txToString<Input>(input)
        console.log(inputResult)

        const outputResult = txToString<Output>(output)
        console.log(outputResult)

        const hash = SHA256(inputResult + outputResult).toString()
        console.log(hash)
    })
})

/*
    // input
    // output
    txToString()


*/
