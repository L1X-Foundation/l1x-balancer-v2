import { Input, toBytes32 } from './deploy';
import { ethers } from 'hardhat';
import fs from 'fs';
async function main() {
  const ProtocolFeePercentagesProviderFactory = await ethers.getContractFactory('ProtocolFeePercentagesProvider');

  const filePath = './deploy/input.json';
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const jsonData: Input = JSON.parse(data);
    const encodedParams4 = ProtocolFeePercentagesProviderFactory.interface.encodeDeploy([
      jsonData.vault, // Once you deply the new vault, update the protocol fee with vault
      100,
      200,
    ]);
    fs.writeFileSync(
      jsonData.dumpPath + '/creationProtocolFee.txt',
      ProtocolFeePercentagesProviderFactory.bytecode.substring(2) + encodedParams4.slice(2)
    );
  } catch (err) {
    console.error('Error reading or writing file:', err);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
