const path = require('path')
const funcs = require('./lib/cacheFuncs')

const usage = `Usage: ${path.basename(process.argv[0])} ${path.basename(process.argv[1])} [memory location in hex] [number of words in block] [number of words in memory] [number of words in cache]
Get the direct, associative, and set associative cache mapping for a memory location.`

try {
    if (process.argv.length !== 6) throw 'Wrong number of arguments.'
    let memLocation, wordsInBlock, wordsInMemory, wordsInCache
    try {
        memLocation = funcs.getChunks(process.argv[2].replace(/\s+/g, ''), 2).join(' ')
        wordsInBlock = funcs.power2Num(process.argv[3])
        wordsInMemory = funcs.power2Num(process.argv[4])
        wordsInCache = funcs.power2Num(process.argv[5])
    } catch (err) {
        throw 'Error with an argument: ' + err
    }
    funcs.printMappings(memLocation, wordsInBlock, wordsInMemory, wordsInCache)
} catch (err) {
    console.error(err)
    console.error(usage)
}