## Deployment
### Local deployment

Deployment is managed by [hardhat-deploy](https://github.com/wighawag/hardhat-deploy) plugin.

####Steps
Run hardhat node
```console
npx hardhat node
```

Run deploy task
```console
npx hardhat --network localhost deploy
```

Export contract ABIs to the front package using **--export-all** parameter

```console
npx hardhat export --export-all ../front/src/contracts/contracts.json
```

Deploy & export
```console
npx hardhat deploy --network localhost --export-all ../front/src/contracts/contracts.json
```
