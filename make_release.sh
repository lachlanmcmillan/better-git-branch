#!/bin/bash

set -x

# make the binary
cargo build --release

BINARY="./better-git-branch"
VERSION="`./target/release/${BINARY} --version`"
OUTPUT_FILE="better-git-branch-${VERSION}.tar.gz"
HASH_FILE="better-git-branch-${VERSION}.tar.gz.sha256.txt"

cd ./target/release

# make the tarball
tar -czf ${OUTPUT_FILE} ${BINARY}

# hash
HASH=`shasum -a 256 ${OUTPUT_FILE}`
echo "${HASH}" > $HASH_FILE

