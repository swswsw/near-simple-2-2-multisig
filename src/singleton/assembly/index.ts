import { storage, Context, u128, ContractPromiseBatch, logging } from "near-sdk-core"
import { assert_self, assert_single_promise_success, XCC_GAS, AccountId  } from "../../utils";


const storageKey:string = 'approvalStorage';
const fundKey:string = 'fund';

@nearBindgen
export class Contract {

  // hmm... class member cannot be const
  // private static const storageKey:string = 'approvalStorage';
  //private storageKey:string = 'approvalStorage';

  private key1:string;
  private key2:string;
  private fund:u128;



  // todo: constructor that takes 2 addresses 
  // constructor
  constructor(key1:string, key2:string) {
    this.key1 = key1;
    this.key2 = key2;
  }

  // deposit token into the contract
  @mutateState()
  deposit(): void {
    // todo: get fund amount from storage and add to it.
    this.fund += Context.attachedDeposit;
    //this.sender = Context.sender; 
    storage.set(fundKey, this.fund);
  }

  @mutateState()
  withdraw(recipient:string, withdrawAmount:u128): void {
    // check if this comes from one of the approved address first.
    // get the data from storage, 
    // if data does not exist yet.  save the approval
    // if both approved, then send the fund
    // if this approval is different from current one (different recipient or amount, overwrite the old one.  only one approval is stored)
    // record which address approved this.  store in storage
    // if both address approved this.  then send the fund to recipient.

    let sender = Context.sender; // sender is i32
    if (sender != this.key1 && sender != this.key2) {
      assert(sender != this.key1 && sender != this.key2, 'user must be one of the approved user');
    }

    if (isKeyInStorage(storageKey)) {
      // changing type, otherwise, will get compile error: 
      // ERROR TS2322: Type '~lib/string/String | null' is not assignable to type '~lib/string/String'.
      let storageValue:string | null = storage.getString(storageKey); // str should be something like <addr>-<amount>
      if (storageValue !== null) {
        let sStorageValue = storageValue.toString();
        let splited = sStorageValue.split('-');
        let addr = splited[0];
        let sAmount = splited[1];
        let amount = u128.from(sAmount);
        if (addr != sender && (addr == this.key1 || addr == this.key2) && amount == withdrawAmount) {
          // another person has adlready approved it
          // make the transfer

        } else {
          // first person to approve this.  
          let str2 = sender + '-' + withdrawAmount.toString();
          storage.setString(storageKey, str2);
        }
      } else {
        // first person to approve this.  
        let str2 = sender + '-' + withdrawAmount.toString();
        storage.setString(storageKey, str2);
      }
      
    }
  }


  // private transfer(addr:string, amount:u128): void {
  //   // todo: 
  // }

  private transfer(addr:string, amount:u128): void {
    this.assert_owner()

    //assert(this.contributions.received > u128.Zero, "No received (pending) funds to be transferred")

    const to_self = Context.contractName
    const to_owner = ContractPromiseBatch.create(this.owner)

    // transfer earnings to owner then confirm transfer complete
    const promise = to_owner.transfer(amount)
    promise.then(to_self).function_call("on_transfer_complete", '{}', u128.Zero, XCC_GAS)
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
