#!/bin/bash

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

while [ true ]; do
    echo "Cache-Mapper"
    echo -n "Enter the memory address: "
    read memLocation
    echo -n "Enter the number of words in a block: "
    read wordsInBlock
    echo -n "Enter the number of words in memory: "
    read wordsInMemory
    echo -n "Enter the number of words in the cache: "
    read wordsInCache
    echo ""
    node "$HERE"/Cache-Mapper.js "$memLocation" "$wordsInBlock" "$wordsInMemory" "$wordsInCache"
    echo ""
done
