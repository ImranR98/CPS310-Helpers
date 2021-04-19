const path = require('path')
const data = require('./lib/6809Data')
const funcs = require('./lib/6809Funcs')

const usage = `Usage: ${path.basename(process.argv[0])} ${path.basename(process.argv[1])} [option] [action] [input] [mode?]
Assemble/disassemble code for the 6809 instruction set.
    [option]    1 for opcodes, 2 for post-bytes, 3 for full or 'modes' to list all addressing modes.
    [action]    1 to get the assembly code for a given compiled hexadecimal input; 2 for the opposite.
    [input]     The appropriate assembly or hexadecimal input.
    [mode]      The addressing mode number - required for option 1 action 2.
                Here are the numbered addressing modes:
                ${Object.keys(data.addressingModes).map((key, index) => (index + 1) + '. ' + data.addressingModes[key]).join('\n                ')}
`

try {
    if (process.argv[2] === 'modes') {
        console.log(Object.keys(data.addressingModes).map((key, index) => (index + 1) + '. ' + data.addressingModes[key]).join('\n'))
        process.exit()
    }
    const option = Number.parseInt(process.argv[2])
    if (Number.isNaN(option)) throw 'Option argument is invalid.'
    if (option < 1 || option > 3) throw 'Option argument is out of range.'
    const action = Number.parseInt(process.argv[3])
    if (Number.isNaN(action)) throw 'Action argument is invalid.'
    if (action < 1 || action > 2) throw 'Action argument is out of range.'
    let input = process.argv[4]
    if (!input) throw 'Input argument is not given.'
    input = input.toUpperCase()
    let mode = null
    if (option === 1 && action === 2) {
        const modeNum = Number.parseInt(process.argv[5])
        if (Number.isNaN(modeNum)) throw 'Addressing mode argument is invalid.'
        if (modeNum < 1 || modeNum > Object.keys(data.addressingModes).length) throw 'Addressing mode argument is out of range.'
        mode = data.addressingModes[Object.keys(data.addressingModes)[modeNum - 1]]
    }

    switch (option.toString() + action.toString()) {
        case '11': // opCodes: code to assembly
            const opAssembly = funcs.getAssemblyOpCode(input)
            console.log(`Assembly code(s): ${opAssembly.assembly.join(', ')}\nMode: ${opAssembly.mode}\nBytes: ${opAssembly.bytes}`)
            break;
        case '12': // opCodes: assembly to compiled
            const opCompiled = funcs.getCompiledOpCode(input, mode)
            console.log(opCompiled)
            break;
        case '21': // postBytes: code to assembly
            const PBAssembly = funcs.getAssemblyPostByte(input)
            console.log(PBAssembly)
            break;
        case '22': // postBytes: assembly to compiled
            const PBCompiled = funcs.getCompiledPostByte(input)
            console.log(PBCompiled)
            break;
        case '31': // Full: code to assembly
            const assembly = funcs.getAssemblyFull(input)
            console.log(assembly)
            break;
        case '32': // Full: assembly to compiled
            const compiled = funcs.getCompiledFull(input)
            console.log(compiled)
            break;
    }
} catch (err) {
    console.error(err)
    console.error(usage)
}