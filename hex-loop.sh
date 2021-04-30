#!/bin/bash

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

echo "Hex"

PS3="
Pick an option: "
options=(
    "bin2Hex"
    "hex2Bin"
    "hex2Dec"
    "ensureHex"
)
while [ true ]; do
    select option in "${options[@]}"; do
        case "$option" in
        "bin2Hex")
            echo -n "Enter Input: "
            read input
            echo ""
            node "$HERE"/hex.js 1 "$input"
            echo ""
            break
            ;;
        "hex2Bin")
            echo -n "Enter Input: "
            read input
            echo ""
            node "$HERE"/hex.js 2 "$input"
            echo ""
            break
            ;;
        "hex2Dec")
            echo -n "Enter Input: "
            read input
            echo ""
            node "$HERE"/hex.js 3 "$input"
            echo ""
            break
            ;;
        "ensureHex")
            echo -n "Enter Input: "
            read input
            echo -n "Enter numBytes: "
            read numb
            echo ""
            node "$HERE"/hex.js 4 "$input" "$numb"
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
