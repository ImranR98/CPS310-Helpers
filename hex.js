const path = require('path')
const funcs = require('./lib/6809Funcs')

const usage = `Usage: ${path.basename(process.argv[0])} ${path.basename(process.argv[1])} [option] [input] [numBytes]
Provides access to hex2Dec and ensureHex functions.
    [option]    1 for hex2Dec, 2 for ensureHex.
    [input]     Input data.
    [numBytes]  Number of bytes (used in ensureHex) - 2 by default.
`

try {
    const option = Number.parseInt(process.argv[2])
    if (Number.isNaN(option)) throw 'Option argument is invalid.'
    if (option < 1 || option > 2) throw 'Option argument is out of range.'
    const input = process.argv[3]
    if (!input) throw 'Input argument is not given.'

    if (option === 1) {
        console.log(funcs.hex2Dec(input))
    }
    if (option === 2) {
        const numBytes = Number.parseInt(process.argv[4])
        if (Number.isNaN(numBytes)) throw 'numBytes argument is invalid.'
        if (numBytes < 1) throw 'numBytes argument is out of range.'
        console.log(input, numBytes)
        console.log(funcs.ensureHex(input, numBytes))
    }
} catch (err) {
    console.error(err)
    console.error(usage)
}