#!/usr/bin/env bash
set -e

[ -z "$NEAR_ENV" ] && echo "Missing \$NEAR_ENV environment variable" && exit 1
[ -z "$CONTRACT" ] && echo "Missing \$CONTRACT environment variable" && exit 1
[ -z "$OWNER" ] && echo "Missing \$SPEAKER environment variable" && exit 1

echo
echo 'About to call say() on the contract'
echo near call \$CONTRACT deposit '' --account_id \$OWNER --amount \2
echo
echo \$CONTRACT is $CONTRACT
echo \$SPEAKER is $SPEAKER
echo \$1 is [ $1 ] '(the message)'
echo \$2 is [ $2 NEAR ] '(optionally attached amount)'
echo
near call $CONTRACT withdraw '{"recipient":"'"gameofstake.testnet"'", "withdrawAmount":"'"100000000000000000000000"'"}' --account_id $OWNER2
