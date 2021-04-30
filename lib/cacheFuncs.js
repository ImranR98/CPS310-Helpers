// Splits a string into an array of chunks of specified length
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

// Converts an unsigned hex string into a binary string
const hex2Bin = (hax) => Number.parseInt(hax, 16).toString(2)

// Converts an unsigned binary string into a hex string
const bin2Hex = (bin) => {
    let hex = Number.parseInt(bin, 2).toString(16)
    while (hex.length % 2 !== 0) hex = '0' + hex
    return hex
}

// Splits a binary string based on the provided layout array
const rearrangeBin = (bin, layout) => {
    bin = getChunks(bin, 1).reverse()
    let rearranged = []
    for (let i = 0; i < layout.length; i++) {
        rearranged.push('')
        for (let y = 0; y < layout[i]; y++) {
            rearranged[rearranged.length - 1] += bin.pop()
        }
    }
    return rearranged
}

// Get the bit layout for direct mapping
const getDirectLayout = (wordsInBlock, wordsInMemory, wordsInCache) => {
    const wordBits = Math.log2(wordsInBlock)
    const blockBits = Math.log2(wordsInCache / wordsInBlock)
    const tagBits = Math.log2(wordsInMemory) - (wordBits + blockBits)
    return [tagBits, blockBits, wordBits]
}

// Get the bit layout for associative mapping
const getAssociativeLayout = (wordsInBlock, wordsInMemory) => {
    const wordBits = Math.log2(wordsInBlock)
    const tagBits = Math.log2(wordsInMemory) - wordBits
    return [tagBits, wordBits]
}

// Get the bit layout for set associative mapping
const getSetAssociativeLayout = (wordsInBlock, wordsInMemory, wordsInCache) => {
    const wordBits = Math.log2(wordsInBlock)
    const tagBits = Math.log2(wordsInCache / wordsInBlock)
    const setBits = Math.log2(wordsInMemory) - (wordBits + tagBits)
    return [tagBits, setBits, wordBits]
}

// Convert the provided string into a number, calculating the answer if the string contains a power symbol (^)
const power2Num = (input) => {
    input = input.replace(/\s+/g, '').split('^')
    if (input.length === 2)
        input = Math.pow(Number.parseFloat(input[0]), Number.parseFloat(input[1]))
    else if (input.length === 1)
        input = input[0]
    else throw null
    return input
}

// Returns a string showing the given number as a power of 2
const powerOf2 = (num) => {
    return '2^' + Math.log2(num)
}

// Use the provided arguments to print the cache mapping info for the given memory location
const printMappings = (memLocation, wordsInBlock, wordsInMemory, wordsInCache) => {
    console.log('DATA:')
    console.log('Memory location:\t' + memLocation)
    console.log('Words in block:\t\t' + powerOf2(wordsInBlock) + '\t[1 block = ' + Math.log2(wordsInBlock) + ' bits]')
    console.log('Words in memory:\t' + powerOf2(wordsInMemory) + '\t[' + powerOf2(wordsInMemory / wordsInBlock) + ' blocks]')
    console.log('Words in cache:\t\t' + powerOf2(wordsInCache) + '\t[' + powerOf2(wordsInCache / wordsInBlock) + ' blocks]')

    const layoutArray = [
        { mode: 'Direct', layout: getDirectLayout(wordsInBlock, wordsInMemory, wordsInCache) },
        { mode: 'Associative', layout: getAssociativeLayout(wordsInBlock, wordsInMemory, wordsInCache) },
        { mode: 'Set Associative', layout: getSetAssociativeLayout(wordsInBlock, wordsInMemory, wordsInCache) }
    ]

    layoutArray.forEach(layoutMode => {
        const numBits = layoutMode.layout.reduce((prev, curr) => prev + curr)
        let memBin = hex2Bin(memLocation.replace(/\s+/g, ''))
        while (memBin.length < numBits) memBin = '0' + memBin
        console.log('\n' + layoutMode.mode.toUpperCase() + ' MAPPING:')
        console.log('Layout:\t\t\t' + layoutMode.layout.join(' bits, ') + ' bits')
        console.log('Memory in binary:\t' + getChunks(memBin, 4).join(' '))
        const rearranged = rearrangeBin(memBin, layoutMode.layout)
        console.log('Rearranged:\t\t' + rearranged.join(' '))
        console.log('Final mapping in hex:\t' + rearranged.map(bin => bin2Hex(bin).toUpperCase()).join(' '))
    })
}

module.exports = { getChunks, power2Num, printMappings }