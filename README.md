# a simple 2-of-2 multisig wallet

1. create a contract that specifies 2 owners
2. anyone can deposit into this wallet
3. sending money requires approval from both owners

## functionalities

### constructor()
- creates the contract
- specifies the 2 owners

### deposit()
- anyone can call this function to deposit Near into the contract
-   Context.attachedDeposit shows how much is deposited into the contract

### withdraw()
- withdraw (or sending Near to another party) requires approval from both owners
- so both owners have to call withdraw() with the same <recipient, amount> to complete withdraw.
- when one owner calls withdraw(), the approval is recorded in storage
- when the second owners calls withdraw(), the withdraw is completed and token will be transferred.


## future works
Attach UI

May be generalized to m-of-n multisig later.



