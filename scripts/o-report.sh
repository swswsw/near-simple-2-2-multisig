#!/usr/bin/env bash
set -e

[ -z "$NEAR_ENV" ] && echo "Missing \$NEAR_ENV environment variable" && exit 1
[ -z "$CONTRACT" ] && echo "Missing \$CONTRACT environment variable" && exit 1
[ -z "$OWNER" ] && echo "Missing \$OWNER environment variable" && exit 1

echo "These are the environment variables being used:"
echo
echo "CONTRACT is [ $CONTRACT ]"
echo "OWNER is [ $OWNER ]"
echo
echo

echo "--------------------------------------------"
echo Report for $CONTRACT
echo "--------------------------------------------"
# how much the fund is
echo "near call \$CONTRACT getFund '{}' --accountId \$OWNER"
near call $CONTRACT getFund '{}' --accountId $OWNER
echo

# report if there is any pending approval right now
echo "near call \$CONTRACT getApproval '{}' --accountId \$OWNER"
near call $CONTRACT getApproval '{}' --accountId $OWNER
echo
echo
