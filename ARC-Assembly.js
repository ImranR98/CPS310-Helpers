const usage = `Usage: ${process.argv[0].split('/').pop()} ${process.argv[1].split('/').pop()} [choice] [input]
Assemble/Disassemble binary code for ARC.
    [choice]    0 for Assembly (Assembly to Binary), 1 for Disassembly (Binary to Assembly).
    [input]     String of binary.`

const op310s = [
    { assembly: 'addcc', binary: '010000' },
    { assembly: 'andcc', binary: '010001' },
    { assembly: 'orcc', binary: '010010' },
    { assembly: 'orncc', binary: '010110' },
    { assembly: 'srl', binary: '100110' },
    { assembly: 'jmpl', binary: '111000' },
    { assembly: 'subcc', binary: '010100' }
]
const op311s = [
    { assembly: 'ld', binary: '000000' },
    { assembly: 'st', binary: '000100' }
]
const conds = [
    { assembly: 'be', binary: '0001' },
    { assembly: 'bcs', binary: '0101' },
    { assembly: 'bneg', binary: '0110' },
    { assembly: 'bvs', binary: '0111' },
    { assembly: 'ba', binary: '1000' }
]

const binLookup = (assembly, group) => {
    const res = group.find(item => item.assembly === assembly)
    return res ? res.binary : res
}
const assLookup = (binary, group) => {
    const res = group.find(item => item.binary === binary)
    return res ? res.assembly : res
}

getRegister = (str, len = 5) => {
    if (!str.startsWith('%r')) return null
    try {
        return Number.parseInt(str.slice(2)).toString(2).padStart(len, '0')
    } catch (err) { return null }
}

const assemble = (assembly) => {
    let args = assembly.split(',').join(' ').split(' ').map(word => word.trim()).filter(word => word.length > 0)
    const command = args.reverse().pop()
    args.reverse()
    if (command === 'sethi') { // Sethi Op
        if (args.length !== 2) throw `Command '${command}' should have 2 arguments.`
        const imm22 = Number.parseInt(args[0]).toString(2).padStart(22, '0')
        const rd = getRegister(args[1])
        return `00 ${rd} 100 ${imm22}`
    } else if (binLookup(command, op310s) || binLookup(command, op311s)) { // Arithmetic/Memory Op
        let onezero = true
        let op3 = binLookup(command, op310s)
        if (!op3) {
            op3 = binLookup(command, op311s)
            onezero = false
        }
        if (op3 === '111000') {
            let temp = args.reverse().pop()
            args.reverse()
            temp = temp.split('+')
            args = temp.concat(args)
        }
        if (!onezero) {
            if (op3 === '000100')
                args.reverse()
            args = ['%r0'].concat(args)
        }
        if (args.length !== 3) throw `Command '${command}' should have 3 arguments.`
        const rs1 = getRegister(args[0])
        const rd = getRegister(args[2])
        let usesMem = false
        let rs2simm13 = getRegister(args[1])
        if (!rs2simm13) {
            usesMem = true
            rs2simm13 = Number.parseInt(args[1]).toString(2).padStart(13, '0')
        } else rs2simm13 += '00000000'
        if (!rs1 || !rd || !rs2simm13) throw 'One or more arguments are invalid.'
        return `${onezero ? '10' : '11'} ${rd} ${op3} ${rs1} ${usesMem ? '1' : '0'} ${rs2simm13}`
    } else if (binLookup(command, conds)) { // Branch Op
        const cond = binLookup(command, conds)
        if (args.length !== 1) throw `Command '${command}' should have 1 argument.`
        const disp22 = Number.parseInt(args[0]).toString(2).padStart(22, '0')
        return `00 0 ${cond} 010 ${disp22}`
    } else if (command === 'call') { // Call Op
        if (args.length !== 1) throw `Command '${command}' should have 1 argument.`
        const disp30 = Number.parseInt(args[0]).toString(2).padStart(30, '0')
        return `01 ${disp30}`
    } else throw `Command '${command}' not found.`
}

const disassemble = (binary) => {
    binary = binary.split(' ').join('')
    if (binary.length !== 32) throw 'Binary must contain 32 bits.'
    for (let i = 0; i < binary.length; i++)
        if (binary[i] !== '0' && binary[i] !== '1')
            throw 'Binary contains an invalid character.'
    const op = binary.slice(0, 2)
    if (op[0] === '1') { // Arithmetic/Memory Op
        const rd = binary.slice(2, 7)
        const op3 = binary.slice(7, 13)
        const rs1 = binary.slice(13, 18)
        const rs2simm13String = binary[18] === '0' ? '%r' + Number.parseInt(binary.slice(27), 2) : Number.parseInt(binary.slice(19), 2)
        if (op3 === '000100') return `${assLookup(op3, op310s.concat(op311s))}    %r${Number.parseInt(rd, 2)}, ${rs2simm13String}`
        else if (op3 === '000000') return `${assLookup(op3, op310s.concat(op311s))}    ${rs2simm13String}, %r${Number.parseInt(rd, 2)}`
        else if (op3 === '111000') return `${assLookup(op3, op310s.concat(op311s))}    %r${Number.parseInt(rs1, 2)}+${rs2simm13String}, %r${Number.parseInt(rd, 2)}`
        else return `${assLookup(op3, op310s.concat(op311s))}    %r${Number.parseInt(rs1, 2)}, ${rs2simm13String}, %r${Number.parseInt(rd, 2)}`
    } else if (op[1] === '1') { // Call Op
        const disp30 = binary.slice(2)
        return `call    ${Number.parseInt(disp30, 2)}`
    } else { // Sethi/Branch Op
        const immdisp22 = binary.slice(10)
        if (binary[2] === '0') { // Branch
            const cond = binary.slice(3, 7)
            return `${assLookup(cond, conds)} ${Number.parseInt(immdisp22, 2)}`
        } else { // Sethi
            const rd = binary.slice(2, 7)
            return `sethi   ${Number.parseInt(immdisp22, 2)}, %r${Number.parseInt(rd, 2)}`
        }
    }
}

if (process.argv.length === 2) {
    console.log(usage)
    process.exit()
}

try {
    if (process.argv.length !== 4)
        throw 'Incorrect number of arguments.'
    const choice = process.argv[2].trim()
    const input = process.argv[3].trim()
    if (choice === '0') console.log(assemble(input))
    else if (choice === '1') console.log(disassemble(input))
    else throw 'Choice must be 0 or 1.'
} catch (err) {
    console.error(`Error: ${err}\n`)
    console.error(usage)
    process.exit(-1)
}