// function log<Type>(n: Type) {
//     console.log('result: ', n)
// }
// // 제네릭
// log<String>('123')

// export class Output {
//     public address: string
//     public amount: number
//     constructor(_address: string, _amount: number) {
//         this.address = _address
//         this.amount = _amount
//     }
// }

export class Output {
    [address: string]: number
    constructor(_address: string, _amount: number) {
        this.address = Number(_address)
        this.amount = _amount
    }
}

export class Input {
    public signature: string

    constructor(_output: Output) {
        this.signature = Input.sum(_output)
    }

    static sum(_output: Output): string {
        return Object.values(_output).join('')
    }
}
