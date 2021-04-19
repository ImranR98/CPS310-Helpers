#!/bin/bash

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

echo "ARC-Assembly"

PS3="
Pick an option: "
options=(
    "Assemble"
    "Disassemble"
    "Help"
)
while [ true ]; do
    select option in "${options[@]}"; do
        case "$option" in
        "Assemble")
            echo -n "Enter Assembly: "
            read input
            echo ""
            node "$HERE"/ARC-Assembly.js 0 "$input"
            echo ""
            break
            ;;
        "Disassemble")
            echo -n "Enter Binary: "
            read input
            echo ""
            node "$HERE"/ARC-Assembly.js 1 "$input"
            echo ""
            break
            ;;
        "Help")
            echo ""
            node "$HERE"/ARC-Assembly.js
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
