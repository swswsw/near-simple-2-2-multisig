#!/usr/bin/env bash

[ -z "$CONTRACT" ] && echo "Missing \$CONTRACT environment variable"
[ -z "$OWNER" ] && echo "Missing \$OWNER environment variable"
[ -z "$OWNER2"] && echo "Missing \$OWNER2 environment variable"

echo "deleting $CONTRACT and setting $OWNER as beneficiary"
echo
near delete $CONTRACT $OWNER

echo --------------------------------------------
echo
echo "cleaning up the /neardev folder"
echo
rm -rf ./neardev

# exit on first error after this point to avoid redeploying with successful build
set -e

echo --------------------------------------------
echo
echo "rebuilding the contract (release build)"
echo
yarn build:release

echo --------------------------------------------
echo
echo "redeploying the contract"
echo
near dev-deploy ./build/release/singleton.wasm

echo --------------------------------------------
echo run the following commands
echo
echo 'export CONTRACT=<dev-123-456>'
echo 'export OWNER=<your own account>'
echo 'export OWNER2=<second owner of multisig wallet>'
echo "near call \$CONTRACT init '{\"key1\":\"'\$OWNER'\", \"key2\":\"'\$OWNER2'\"}' --accountId \$CONTRACT"
echo
echo

exit 0
