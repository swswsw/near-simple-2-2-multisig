import { storage, Context, u128, ContractPromiseBatch, logging } from "near-sdk-core"
import { assert_self, assert_single_promise_success, XCC_GAS, AccountId  } from "../../utils";


const storageKey:string = 'approvalStorage';
const fundKey:string = 'fundStorage';
const delimiter = '-';

@nearBindgen
export class Contract {

  // hmm... class member cannot be const
  // private static const storageKey:string = 'approvalStorage';

  private key1:string;
  private key2:string;
  private fund:u128;


  // constructor
  constructor(key1:string, key2:string) {
    this.key1 = key1;
    this.key2 = key2;
  }

  // deposit token into the contract
  @mutateState()
  deposit(): void {

    let fundValue:u128 | null = storage.get<u128>(fundKey);
    if (fundValue !== null) {
      logging.log("fund before deposit: " + fundValue.toString());
      this.fund = u128.add(fundValue, Context.attachedDeposit);
    } else {
      this.fund = Context.attachedDeposit;
    }
    
    //this.sender = Context.sender; 
    storage.set(fundKey, this.fund);
  }

  @mutateState()
  withdraw(recipient:string, withdrawAmount:string): void {
    // check if this comes from one of the approved address first.
    // get the data from storage, 
    // if data does not exist yet.  save the approval
    // if both approved, then send the fund
    // if this approval is different from current one (different recipient or amount, overwrite the old one.  only one approval is stored)
    // record which address approved this.  store in storage
    // if both address approved this.  then send the fund to recipient.

    logging.log("withdraw " + withdrawAmount + " to " + recipient);

    let uWithdrawAmount = u128.from(withdrawAmount);

    let sender = Context.sender; // sender is i32
    if (sender != this.key1 && sender != this.key2) {
      assert(sender != this.key1 && sender != this.key2, 'user must be one of the approved user');
    }

    if (isKeyInStorage(storageKey)) {
      // type can't be string, it will get compile error: 
      // ERROR TS2322: Type '~lib/string/String | null' is not assignable to type '~lib/string/String'.
      // storageValue should be something like <approver>-<recipient>-<amount>.  eg. gameofstake.testnet-solomonwu.testnet-1000000000000
      let storageValue:string | null = storage.getString(storageKey); 
      // this probably is better done as a structured data.

      if (storageValue !== null) {
        logging.log("pending approval=" + storageValue);

        let splitted = storageValue.split(delimiter);
        let oldApprover = splitted[0];
        let oldRecipient = splitted[1];
        let sOldAmount = splitted[2];
        let oldAmount = u128.from(sOldAmount);
        if (oldApprover != sender && (oldApprover == this.key1 || oldApprover == this.key2) 
          && oldRecipient == recipient 
          && oldAmount == uWithdrawAmount) {
          // another person has already approved it
          // make the transfer
          this.transfer(recipient, uWithdrawAmount);

        } else {
          // first person to approve this.
          logging.log("overwrite the earlier approval with this new approval");
          let str2 = Contract.buildApprovalValue(sender, recipient, uWithdrawAmount);
          storage.setString(storageKey, str2);
        }
      } else {
        // first person to approve this.  
        let str2 = Contract.buildApprovalValue(sender, recipient, uWithdrawAmount);
        storage.setString(storageKey, str2);
      }
      
    } else {
      // first person to approve this.  
      logging.log("first person to approve this.");
      let str2 = Contract.buildApprovalValue(sender, recipient, uWithdrawAmount);
      storage.setString(storageKey, str2);
    }
  }

  private static buildApprovalValue(approver:string, recipient:string, amount:u128): string {
    let str = approver + delimiter + recipient + delimiter + amount.toString();
    logging.log("approval str=" + str);
    return str;
  }

  private transfer(addr:string, amount:u128): void {
    this.assert_owner()

    //assert(this.contributions.received > u128.Zero, "No received (pending) funds to be transferred")

    const to_self = Context.contractName
    const to_recipient = ContractPromiseBatch.create(addr)

    // transfer earnings to owner then confirm transfer complete
    const promise = to_recipient.transfer(amount)
    promise.then(to_self).function_call("on_transfer_complete", '{"amount":amount}', u128.Zero, XCC_GAS)
  }

  @mutateState()
  on_transfer_complete(): void {
    assert_self()
    assert_single_promise_success()

    logging.log("transfer complete")
    // todo: track fund change
    
  }

  // 2 owners
  private assert_owner(): void {
    const caller = Context.predecessor
    assert(this.key1 == caller || this.key2 == caller, "Only the owner of this contract may call this method")
  }

  /**
  write the given value at the given key to account (contract) storage
  ---
  note: this is what account storage will look like AFTER the write() method is called the first time
  ╔════════════════════════════════╤══════════════════════════════════════════════════════════════════════════════════╗
  ║                            key │ value                                                                            ║
  ╟────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────╢
  ║                          STATE │ {                                                                                ║
  ║                                │   "message": "data was saved"                                                    ║
  ║                                │ }                                                                                ║
  ╟────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────╢
  ║                       some-key │ some value                                                                       ║
  ╚════════════════════════════════╧══════════════════════════════════════════════════════════════════════════════════╝
   */
  // @mutateState()
  // write(key: string, value: string): string {
  //   storage.set(key, value)
  //   this.message = 'data was saved' // this is why we need the deorator @mutateState() above the method name
  //   return `✅ Data saved. ( ${this.storageReport()} )`
  // }


  // private helper method used by read() and write() above
  private storageReport(): string {
    return `storage [ ${Context.storageUsage} bytes ]`
  }
}

/**
 * This function exists only to avoid a compiler error
 *

ERROR TS2339: Property 'contains' does not exist on type 'src/singleton/assembly/index/Contract'.

     return this.contains(key);
                 ~~~~~~~~
 in ~lib/near-sdk-core/storage.ts(119,17)

/Users/sherif/Documents/code/near/_projects/edu.t3/starter--near-sdk-as/node_modules/asbuild/dist/main.js:6
        throw err;
        ^

 * @param key string key in account storage
 * @returns boolean indicating whether key exists
 */
function isKeyInStorage(key: string): bool {
  return storage.hasKey(key)
}
