#!/bin/bash

VERSION="v1.1.0" # todo read this from cargo.toml
BINARY="./better-git-branch"
OUTPUT_FILE="better-git-branch-${VERSION}.tar.gz"
HASH_FILE="better-git-branch-${VERSION}.tar.gz.sha256.txt"

# make the binary
cargo build --release

cd ./target/release

# make the tarball
tar -czf ${OUTPUT_FILE} ${BINARY}

# hash
shasum -a 256 ${OUTPUT_FILE} > ${HASH_FILE}
