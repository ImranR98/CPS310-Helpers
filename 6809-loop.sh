#!/bin/bash

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

echo "6809-Assembly"

PS3="
Pick an option: "
options=(
    "Full Assembly to Compiled Hex"
    "Full Compiled Hex to Assembly"
    "Opcode Assembly to Compiled Hex"
    "Opcode Compiled Hex to Assembly"
    "Post-byte Assembly to Compiled Hex"
    "Post-byte Compiled Hex to Assembly"
)
while [ true ]; do
    select option in "${options[@]}"; do
        case "$option" in
        "Full Assembly to Compiled Hex")
            echo -n "Enter Assembly: "
            read input
            echo ""
            node "$HERE"/6809-Assembly.js 3 2 "$input"
            echo ""
            break
            ;;
        "Full Compiled Hex to Assembly")
            echo -n "Enter Hex: "
            read input
            echo ""
            node "$HERE"/6809-Assembly.js 3 1 "$input"
            echo ""
            break
            ;;
        "Opcode Assembly to Compiled Hex")
            echo -n "Enter Assembly: "
            read input
            echo "Addressing Modes:"
            node "$HERE"/6809-Assembly.js "modes"
            echo -n "Enter an addressing mode number: "
            read mode
            echo ""
            node "$HERE"/6809-Assembly.js 1 2 "$input" "$mode"
            echo ""
            break
            ;;
        "Opcode Compiled Hex to Assembly")
            echo -n "Enter Hex: "
            read input
            echo ""
            node "$HERE"/6809-Assembly.js 1 1 "$input"
            echo ""
            break
            ;;
        "Post-byte Assembly to Compiled Hex")
            echo -n "Enter Assembly: "
            read input
            echo ""
            node "$HERE"/6809-Assembly.js 2 2 "$input"
            echo ""
            break
            ;;
        "Post-byte Compiled Hex to Assembly")
            echo -n "Enter Hex: "
            read input
            echo ""
            node "$HERE"/6809-Assembly.js 2 1 "$input"
            echo ""
            break
            ;;
        *)
            echo "Do you see '$REPLY' in the options? FOCUS."
            break
            ;;
        esac
    done
    echo ''
done
