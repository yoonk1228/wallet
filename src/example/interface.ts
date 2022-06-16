function isSome(num: number): Failable<string, string> {
    if (num != 5) return { isError: true, error: `${num}은 틀렸씁니다.` }
    return { isError: false, value: `${num}}이 맞습니다.` }
}

const result = isSome(1)

if (result.isError) console.log(result.error)
