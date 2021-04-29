const ensureHex = (input, numBytes) => {
    if (input.startsWith('$')) {
        input = input.slice(1)
    } else {
        let dec = Number.parseInt(input)
        let bin = dec.toString(2)
        if (input[0] === '-') {
            bin = Number.parseInt(dec * -1).toString(2)
            bin = (~Number.parseInt(bin, 2) + 1 >>> 0).toString(2)
            bin = bin.slice(bin.length - numBytes * 8)
        }
        input = Number.parseInt(bin, 2).toString(16).toUpperCase()
    }
    while (input.length % 2 !== 0) input = '0' + input
    return input
}

console.log(ensureHex('$FFFE'))