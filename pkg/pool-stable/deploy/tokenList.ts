// import { Input, bignumberToNumber } from './deploy';
import { ethers } from 'hardhat';
import fs from 'fs';
import { fp } from '@balancer-labs/v2-helpers/src/numbers';
import { getPoolInstance } from './tool';
export const filePath = './deploy/input.json';
async function main() {
  const data = fs.readFileSync(filePath, 'utf8');
  const jsonData = JSON.parse(data);
  console.log('JSON Data:', jsonData);


  const contract = await getPoolInstance();
  console.log(
    'token list bytecode',
    await contract.vault.populateTransaction.getPoolTokens(jsonData.TokenListByPoolIdCall.poolId)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
