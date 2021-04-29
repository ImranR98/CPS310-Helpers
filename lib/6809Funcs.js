const data = require('./6809Data')

const getChunks = (str, size) => {
    let arr = [];
    if (!str || !size) return arr
    if (str.length === 0) return arr
    for (let i = 0; i < str.length; i += size) {
        let chunk = ''
        for (let y = 0; y < size; y++)
            chunk += str[i + y] || ''
        arr.push(chunk)
    }
    return arr
}

const hex2Dec = (hex) => {
    let finalDec = ''
    let bin = Number.parseInt(hex, 16).toString(2)
    if (bin[0] === '1') {
        bin = (~Number.parseInt(bin, 2) + 1 >>> 0).toString(2)
        bin = bin.slice(bin.indexOf(0))
        finalDec += '-'
    }
    finalDec += Number.parseInt(bin, 2).toString()
    return finalDec
}

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
        input = Number.parseInt(bin, 2)
        input = Number.isNaN(input) ? null : input.toString(16).toUpperCase()
    }
    if (input)
        while (input.length % 2 !== 0) input = '0' + input
    return input
}

const getAssemblyOpCode = (code) => {
    if (typeof code !== 'string') return null
    return data.opCodes.get(code) || null
}

const getCompiledOpCode = (assembly, mode) => {
    if (typeof assembly !== 'string') return null
    for (let [c, d] of data.opCodes)
        if (d.assembly.includes(assembly) && d.mode === mode) return getChunks(c, 2).join(' ')

    return null
}

const getAssemblyPostByte = (code) => {
    if (typeof code !== 'string') return null
    const bytes = getChunks(code.replace(/\s+/g, ''), 2)
    let result = data.postBytes.get(bytes[0])
    if (!result) return null
    const numBytesRemaining = result.split('m').join('n').split('nn').length - 1
    if (numBytesRemaining === 0) return result
    if (bytes.length < numBytesRemaining + 1) return null
    let remainingHex = bytes.slice(1, numBytesRemaining + 1).join('')
    let finalDec = hex2Dec(remainingHex)
    result = result.split('m').join('n')
    result = result.slice(0, result.indexOf('n')) + finalDec + result.slice(result.indexOf('n'))
    result = result.split('n').join('')

    return result
}

const getCompiledPostByte = (assembly) => {
    const attemptToMatchMMNN = (val) => {
        if (typeof val !== 'string') return null
        val = val.toUpperCase()
        let startIndex = -1, endIndex = -1;
        [startIndex, endIndex] = [val.indexOf('['), val.indexOf(']') - 1]

        if (startIndex <= 0 || endIndex <= 0) {
            let dollarIndex = val.indexOf('$')
            if (dollarIndex >= 0) {
                startIndex = dollarIndex
                for (let i = dollarIndex + 1; i < val.length - 1; i++) {
                    if (data.hexDigits.indexOf(val[i]) >= 0) endIndex = i
                    else break
                }
            } else {
                for (let i = 0; i < val.length; i++) {
                    if (data.decDigits.indexOf(val[i]) >= 0) {
                        if (startIndex <= 0) startIndex = i
                        if (i > endIndex) endIndex = i
                    }
                }
            }
            if (endIndex >= 0) endIndex++
        }

        if (startIndex >= 0 && endIndex > 0) return [startIndex, endIndex]
        return [-1, -1]
    }

    if (typeof assembly !== 'string') return null
    for (let [c, a] of data.postBytes) {
        if (a === assembly) return c
        else if (a.indexOf('nn') >= 0) {
            const templateDataStartIndex = a.split('m').join('n').indexOf('n')
            const templateDataEndIndex = a.split('m').join('n').lastIndexOf('n') + 1
            const [actualDataStartIndex, actualDataEndIndex] = attemptToMatchMMNN(assembly)
            if (actualDataStartIndex >= 0 && actualDataEndIndex > 0) {
                if (
                    a.slice(0, templateDataStartIndex) === assembly.slice(0, actualDataStartIndex) &&
                    a.slice(templateDataEndIndex) === assembly.slice(actualDataEndIndex)
                ) {
                    const numBytesRemaining = Number.parseInt((templateDataEndIndex - templateDataStartIndex) / 2)
                    let val = assembly.slice(actualDataStartIndex, actualDataEndIndex)
                    let fin = ensureHex(val, numBytesRemaining) || '??'
                    return c + ' ' + getChunks(fin, 2).join(' ')
                }
            }
        }
    }
    return null
}

const getAssemblyFull = (code) => {
    if (typeof code !== 'string') return null
    let input = code.replace(/\s+/g, '')
    let originalInput = input
    input = [originalInput.slice(0, 2), originalInput.slice(2)]
    let opAssembly = getAssemblyOpCode(input[0])
    if (!opAssembly) {
        input = [originalInput.slice(0, 4), originalInput.slice(4)]
        opAssembly = getAssemblyOpCode(input[0])
    }
    if (!opAssembly) return null
    let remaining = input[1]
    if (remaining) {
        if (opAssembly.mode === data.addressingModes.indexed)
            remaining = getAssemblyPostByte(remaining)
        else if (opAssembly.mode === data.addressingModes.immediate) {
            while (remaining[0] === '0') remaining = remaining.slice(1)
            remaining = '#$' + remaining
        }
        else if (opAssembly.mode === data.addressingModes.direct || opAssembly.mode === data.addressingModes.extended) {
            while (remaining[0] === '0') remaining = remaining.slice(1)
            remaining = '$' + remaining
        } else if (opAssembly.mode === data.addressingModes.relative) {
            remaining = hex2Dec(remaining)
        }
        else if (opAssembly.mode === data.addressingModes.register) {
            let bin = Number.parseInt(remaining, 16).toString(2)
            remaining = ''
            const flags = ['PC', 'S/U', 'Y', 'X', 'DP', 'B', 'A', 'CC']
            while (bin.length < flags.length) bin = '0' + bin
            flags.forEach((key, index) => {
                if (bin[index] === '1') remaining += remaining.length === 0 ? key : ',' + key
            })
        }
    }
    return (opAssembly.assembly || '??') + ' ' + (remaining || '')
}

const getCompiledFull = (assembly) => {
    if (typeof assembly !== 'string') return null
    let temp = assembly.split(' ')[0].trim()
    let input = [temp, assembly.slice(temp.length).trim()]
    let remaining = input[1] ? getCompiledPostByte(input[1]) : null
    let opCodeCompiled = ''
    if (remaining) {
        opCodeCompiled = getCompiledOpCode(input[0], data.addressingModes.indexed)
    } else {
        remaining = input[1] ? input[1] : ''
        if (remaining.startsWith('#')) {
            opCodeCompiled = getCompiledOpCode(input[0], data.addressingModes.immediate)
            remaining = remaining.slice(1)
            remaining = ensureHex(remaining, Number.parseInt(remaining.length / 2)) || '??'
        } else if (
            remaining.startsWith('P') ||
            remaining.startsWith('S') ||
            remaining.startsWith('U') ||
            remaining.startsWith('Y') ||
            remaining.startsWith('X') ||
            remaining.startsWith('D') ||
            remaining.startsWith('B') ||
            remaining.startsWith('A') ||
            remaining.startsWith('C')
        ) {
            opCodeCompiled = getCompiledOpCode(input[0], data.addressingModes.register) || getCompiledOpCode(input[0], data.addressingModes.immediate)
            let bin = ''
            const flags = ['PC', 'S/U', 'Y', 'X', 'DP', 'B', 'A', 'CC']
            flags.forEach((key, index) => {
                if (key !== 'S/U') {
                    if (remaining.indexOf(key) >= 0) bin += '1'
                    else bin += '0'
                } else {
                    if (remaining.indexOf('S') >= 0 || remaining.indexOf('U') >= 0) bin += '1'
                    else bin += '0'
                }
            })
            remaining = Number.parseInt(bin, 2).toString(16)
        } else {
            opCodeCompiled = getCompiledOpCode(input[0], data.addressingModes.extended)
            if (!opCodeCompiled) { // Best guess?
                opCodeCompiled = Object.keys(data.addressingModes).concat(null).map(key => getCompiledOpCode(input[0], key ? data.addressingModes[key] : null)).filter(res => !!res)[0]
            }
            remaining = remaining ? ensureHex(remaining, Number.parseInt(remaining.length / 2)) || '??' : ''
        }
        remaining = getChunks(remaining, 2).join(' ')
    }
    return (opCodeCompiled || '??') + ' ' + (remaining || '')
}

module.exports = { getAssemblyOpCode, getCompiledOpCode, getAssemblyPostByte, getCompiledPostByte, getAssemblyFull, getCompiledFull }