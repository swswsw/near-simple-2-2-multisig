const near = new nearApi.Near({
    keyStore: new nearApi.keyStores.BrowserLocalStorageKeyStore(),
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org'
  });

  // create wallet connection
  const wallet = new nearApi.WalletConnection(near);

  // connect to a NEAR smart contract
  const contract = new nearApi.Contract(wallet.account(), 'dev-1643363054216-73116405445411', {
    viewMethods: [],
    changeMethods: ['deposit','withdraw']
  });

  // auth
  function auth() {
    const accountId = wallet.getAccountId();
    return {
      signed: wallet.isSignedIn(),
      account_id: accountId,
      sign_in() {
        wallet.requestSignIn(
          "dev-1643363054216-73116405445411",
          "2-of-2 Multisig Wallet"
        )
      },
      sign_out() {
        wallet.signOut();
        localStorage.removeItem(`near-api-js:keystore:${accountId}:testnet`);
        accountId.value = wallet.getAccountId()
        this.signed = false
      },
      // TESTING
      test() {
        console.log("test")
      }
    }
  }