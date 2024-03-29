import { FundManagement, SwapKind, WeightedPoolEncoder } from '@balancer-labs/balancer-js';
import { StablePoolEncoder } from '@balancer-labs/balancer-js/src/pool-stable/encoder';
import { MAX_UINT256, ZERO_ADDRESS } from '@balancer-labs/v2-helpers/src/constants';
import { BigNumber, BigNumberish, fp } from '@balancer-labs/v2-helpers/src/numbers';
const { ethers } = require('hardhat');
const fs = require('fs');

// give me random address
const alice = '0x7B7AB20f75B691E90c546e89E41aA23b0A821444';
async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const bob = signers[1];
  const charlie = signers[2];
  console.log('Deploying contracts with the account:', deployer.address);
  const erc20Factory = await ethers.getContractFactory('OldWrappedToken');
  const erc20Params = {
    _name: 'USDC',
    _symbol: 'USDC',
    _decimals: 18,
  };
  console.log(bignumberToNumber(ethers.utils.parseEther('1000000000')));
  const erc20 = await erc20Factory.deploy(erc20Params._name, erc20Params._symbol, erc20Params._decimals, {
    gasLimit: 30000000,
  });
  // write creation code to file
  const encodedParams = erc20Factory.interface.encodeDeploy([
    erc20Params._name,
    erc20Params._symbol,
    erc20Params._decimals,
  ]);

  fs.writeFileSync('./creationCode/creationCode20.txt', erc20Factory.bytecode.substring(2) + encodedParams.slice(2));
  const runtimeBytecode20 = await ethers.provider.getCode(erc20.address);
  fs.writeFileSync('./runtimeCode/runtimeBytecode20.txt', runtimeBytecode20.substring(2));

  console.log('Contract USDC deployed to:', erc20.address);
  const erc20Params2 = {
    _name: 'USDT',
    _symbol: 'USDT',
    _decimals: 18,
  };
  const erc202 = await erc20Factory.deploy(erc20Params2._name, erc20Params2._symbol, erc20Params2._decimals, {
    gasLimit: 30000000,
  });
  // write creation code to file
  const encodedParams2 = erc20Factory.interface.encodeDeploy([
    erc20Params2._name,
    erc20Params2._symbol,
    erc20Params2._decimals,
  ]);

  fs.writeFileSync('./creationCode/creationCode202.txt', erc20Factory.bytecode.substring(2) + encodedParams2.slice(2));
  const runtimeBytecode202 = await ethers.provider.getCode(erc20.address);
  fs.writeFileSync('./runtimeCode/runtimeBytecode202.txt', runtimeBytecode202.substring(2));

  console.log('Contract USDT deployed to:', erc202.address);
  const erc20Params3 = {
    _name: 'BUSD',
    _symbol: 'BUSD',
    _decimals: 18,
  };
  const erc203 = await erc20Factory.deploy(erc20Params3._name, erc20Params3._symbol, erc20Params3._decimals, {
    gasLimit: 30000000,
  });
  console.log('Contract BUSD deployed to:', erc203.address);

  const wethFactory = await ethers.getContractFactory('WETH');
  const weth = await wethFactory.deploy({ gasLimit: 30000000 });
  console.log('Contract weth deployed to:', weth.address);
  // write weth creation code to file

  fs.writeFileSync('./creationCode/creationWeth.txt', wethFactory.bytecode.substring(2));
  const runtimeBytecodeweth = await ethers.provider.getCode(weth.address);
  fs.writeFileSync('./runtimeCode/runtimeBytecodeweth.txt', runtimeBytecodeweth.substring(2));

  const AuthorizerFactory = await ethers.getContractFactory('Authorizer');
  // 100 to soldity bytes32

  const authorizer = await AuthorizerFactory.deploy(deployer.address, {
    gasLimit: 30000000,
  });
  console.log('Contract authorizer deployed to:', authorizer.address);
  // write weth creation code to file

  fs.writeFileSync(
    './creationCode/creationAuthorizer.txt',
    AuthorizerFactory.bytecode.substring(2) +
      AuthorizerFactory.interface.encodeDeploy(['0x75104938baa47c54a86004ef998cc76c2e616289']).slice(2)
  );
  const runtimeBytecodeAuthorizer = await ethers.provider.getCode(authorizer.address);
  fs.writeFileSync('./runtimeCode/runtimeBytecodeAuthorizer.txt', runtimeBytecodeAuthorizer.substring(2));

  const VaultFactory = await ethers.getContractFactory('Vault');
  const vaultParams = {
    authorizer: authorizer.address,
    weth: weth.address,
    pauseWindowDuration: 0,
    bufferPeriodDuration: 0,
  };

  const vault = await VaultFactory.deploy(
    vaultParams.authorizer,
    vaultParams.weth,
    vaultParams.pauseWindowDuration,
    vaultParams.bufferPeriodDuration,
    { gasLimit: 30000000 }
  );

  console.log('Contract vault deployed to:', vault.address);

  const encodedParams3 = VaultFactory.interface.encodeDeploy([
    '0x98f5708a5e6ef3e03cbf7f3913baf7596cb06f78', // change it if you deploy new authorizer
    '0x75efbcee8c37849b63287a1fcd367368a5f0ab80', // change it if you deploy new weth
    vaultParams.pauseWindowDuration,
    vaultParams.bufferPeriodDuration,
  ]);
  fs.writeFileSync('./creationCode/creationVault.txt', VaultFactory.bytecode.substring(2) + encodedParams3.slice(2));
  const runtimeBytecodevault = await ethers.provider.getCode(vault.address);
  fs.writeFileSync('./runtimeCode/runtimeBytecodevault.txt', runtimeBytecodevault.substring(2));

  const balancerQueriesFactory = await ethers.getContractFactory('BalancerQueries');
  const balancerQueries = await balancerQueriesFactory.deploy(vault.address);
  console.log('Contract balancerQueries deployed to:', balancerQueries.address);

  const encodedParams9 = balancerQueriesFactory.interface.encodeDeploy([vault.address]);
  fs.writeFileSync(
    './creationCode/creationBalancerQueries.txt',
    balancerQueriesFactory.bytecode.substring(2) + encodedParams9.slice(2)
  );
  const runtimeBytecodebalancerQueries = await ethers.provider.getCode(balancerQueries.address);
  fs.writeFileSync('./runtimeCode/runtimeBytecodeBalancerQueries.txt', runtimeBytecodebalancerQueries.substring(2));

  // deploy ProtocolFeePercentagesProvider
  const ProtocolFeePercentagesProviderFactory = await ethers.getContractFactory('ProtocolFeePercentagesProvider');
  const protocolFeePercentagesProvider = await ProtocolFeePercentagesProviderFactory.deploy(vault.address, 100, 200, {
    gasLimit: 30000000,
  });
  console.log('Contract protovol fee deployed to:', protocolFeePercentagesProvider.address);

  // deploy rate provider
  const RateProviderFactory = await ethers.getContractFactory('RateProvider');
  const rateProvider = await RateProviderFactory.deploy({ gasLimit: 30000000 });
  console.log('Contract rate provider deployed to:', rateProvider.address);
  fs.writeFileSync('./creationCode/creationRateProvider.txt', RateProviderFactory.bytecode.substring(2));
  const runtimeBytecodeRateProvider = await ethers.provider.getCode(rateProvider.address);
  fs.writeFileSync('./runtimeCode/runtimeBytecodeRateProvider.txt', runtimeBytecodeRateProvider.substring(2));
  // deploy the other rate provider
  const RateProviderFactory2 = await ethers.getContractFactory('RateProvider');
  const rateProvider2 = await RateProviderFactory2.deploy({ gasLimit: 30000000 });
  console.log('Contract rate provider 2 deployed to:', rateProvider2.address);
  fs.writeFileSync('./creationCode/creationRateProvider2.txt', RateProviderFactory.bytecode.substring(2));
  const runtimeBytecodeRateProvider2 = await ethers.provider.getCode(rateProvider.address);
  fs.writeFileSync('./runtimeCode/runtimeBytecodeRateProvider2.txt', runtimeBytecodeRateProvider2.substring(2));

  const RateProviderFactory3 = await ethers.getContractFactory('RateProvider');
  const rateProvider3 = await RateProviderFactory3.deploy({ gasLimit: 30000000 });
  console.log('Contract rate provider 3 deployed to:', rateProvider3.address);
  const composableStablePoolFactory = await ethers.getContractFactory('ComposableStablePoolFactory');
  const composableStablePoolFactoryParams = {
    vault: vault.address,
    protocolFeeProvider: protocolFeePercentagesProvider.address,
    factoryVersion: '1.0.0',
    poolVersion: '1.0.0',
    initialPauseWindowDuration: 0,
    bufferPeriodDuration: 0,
  };

  const composableStablePoolFactoryContract = await composableStablePoolFactory.deploy(
    composableStablePoolFactoryParams.vault,
    composableStablePoolFactoryParams.protocolFeeProvider,
    composableStablePoolFactoryParams.factoryVersion,
    composableStablePoolFactoryParams.poolVersion,
    composableStablePoolFactoryParams.initialPauseWindowDuration,
    composableStablePoolFactoryParams.bufferPeriodDuration,
    { gasLimit: 30000000 }
  );

  console.log('Contract composableStablePoolFactory deployed to:', composableStablePoolFactoryContract.address);
  const encodedParams6 = composableStablePoolFactory.interface.encodeDeploy([
    '0x91c0eb5c5a45997a7c4629efe15629b2af53b0a4',
    '0xdb4a24f16ddfa5a36aa36a038645f9e35efd7837',
    '1.0.0',
    '1.0.0',
    0,
    0,
  ]);
  fs.writeFileSync(
    './creationCode/creationCodePoolFactory.txt',
    composableStablePoolFactory.bytecode.substring(2) + encodedParams6.slice(2)
  );
  const runtimeBytecodePoolFactory = await ethers.provider.getCode(composableStablePoolFactoryContract.address);

  fs.writeFileSync('./runtimeCode/runtimeBytecodePoolFactory.txt', runtimeBytecodePoolFactory.substring(2));

  const abi = [
    'function create(string name, string symbol, address[] tokens, uint256 amplificationParameter, address[] rateProviders, uint256[] tokenRateCacheDurations, bool[] exemptFromYieldProtocolFeeFlags, uint256 swapFeePercentage, address owner, bytes32 salt)',
  ];

  // Create an instance of the contract interface
  const iface = new ethers.utils.Interface(abi);

  // Define the function arguments
  const args = [
    'My Stable Pool',
    'MSP',
    ['0x680bfd4636f924c37ed9d1c95b4fc7e7fe9d80e1', '0x17d47c886f2686d42f3ea43b44045e56ea9d975a'].sort(),
    BigInt('1'),
    ['0xc400d457404897bb08aa44b93431af79c86fe212', '0xeb0285df6e591e1b6567bd2c2c83792b69517068'].sort(),
    [0, 0],
    [false, false],
    BigInt('10000000000000000'),
    '0x75104938baa47c54a86004ef998cc76c2e616289',
    ethers.utils.formatBytes32String('1'),
  ];

  // Generate the calldata
  const calldata = iface.encodeFunctionData('create', args);

  // const createPool = await composableStablePoolFactoryContract.create(
  //   'My Stable Pool pool',
  //   'MSPp',
  //   ['0x18bb9d765b6d607638b80046a9f718979f83ad77', '0xf72341419f2dbd1b9cd5b57d3b5ce6ec1f2ea2b8'].sort(),
  //   BigInt('1'), // amplificationParameter,
  //   ['0x413a64f6b6443b1f199c4414d0d7bfa0f405b3a5', '0x99516987760b4d296a69b7dfe648b5548e86566f'].sort(),
  //   [0, 0], //uint256[] memory tokenRateCacheDurations,
  //   [false, false], // bool[] memory exemptFromYieldProtocolFeeFlags,
  //   BigInt('10000000000000000'), //uint256 swapFeePercentage,
  //   '0x75104938baa47c54a86004ef998cc76c2e616289', //address owner,
  //   // make 1 to bytes32
  //   ethers.utils.formatBytes32String('1')
  // ); //bytes32 salt))

  // const createPool = await composableStablePoolFactoryContract.create(
  //   'My Stable Pool pool',
  //   'MSPp',
  //   [erc20.address, erc202.address].sort(),
  //   BigInt('1'), // amplificationParameter,
  //   ['0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000'].sort(),
  //   [0, 0], //uint256[] memory tokenRateCacheDurations,
  //   [false, false], // bool[] memory exemptFromYieldProtocolFeeFlags,
  //   fp(0.1), //uint256 swapFeePercentage,
  //   '0x75104938baa47c54a86004ef998cc76c2e616289', //address owner,
  //   // make 1 to bytes32
  //   ethers.utils.formatBytes32String('1')
  // ); //bytes32 salt))
  // console.log('createPool', createPool);
  // const res = await createPool.wait();
  // console.log('Res', res);

  // const events = res.events?.filter((e) => e.event && e.event === 'PoolCreated');
  // const xx = await ethers.getContractAt('ComposableStablePool', events[0].args[0]);
  // console.log('Contract createPool deployed to:', events[0].args[0]);
  console.log([erc20.address, erc202.address, erc203.address].sort());
  console.log([rateProvider.address, rateProvider2.address, rateProvider3.address].sort());
  const poolParams = {
    vault: vault.address,
    protocolFeeProvider: protocolFeePercentagesProvider.address,
    name: 'My Stable Pool',
    symbol: 'MSP',
    tokens: [erc20.address, erc202.address, erc203.address].sort(),
    rateProviders: [rateProvider.address, rateProvider2.address, rateProvider3.address].sort(),
    tokenRateCacheDurations: [0, 0, 0],
    exemptFromYieldProtocolFeeFlags: [false, false, false],
    amplificationParameter: BigInt('1'),
    swapFeePercentage: fp(0.1),
    pauseWindowDuration: 0,
    bufferPeriodDuration: 0,
    owner: deployer.address,
    version: '1.0.0',
  };
  const ContractFactory = await ethers.getContractFactory('ComposableStablePool');
  const encodedParams5 = ContractFactory.interface.encodeDeploy([
    // for deploying new stable pool directly
    {
      vault: '0x7ba9268c354b2f0156abdec86ca0ac8e8135673f', // change
      protocolFeeProvider: '0xeda67b104377ffa4e7af8d97503e06dddbb24cdf', // change
      name: 'wETHUSDC-wETHUSDT',
      symbol: 'wETHUSDC-wETHUSDT',
      tokens: ['0x98c16b40e86648ddfa73ac8d1730792ab735b457', '0xa7afd0642cfcadacaee88cdf2b84711a1b11d025'].sort(), // change
      rateProviders: [
        '0x10e32d5cdd1122cf506575702f12b66f0d9ac80b', // change
        '0x6c11eee685845d7decb59802ba64f11acb008470', // change
      ].sort(),
      tokenRateCacheDurations: [0, 0],
      exemptFromYieldProtocolFeeFlags: [false, false],
      amplificationParameter: BigInt('1'),
      swapFeePercentage: fp(0.1),
      pauseWindowDuration: 0,
      bufferPeriodDuration: 0,
      owner: '0x75104938baa47c54a86004ef998cc76c2e616289',
      version: '1.0.0',
    },
  ]);
  fs.writeFileSync(
    './creationCode/creationCodePool.txt',
    ContractFactory.bytecode.substring(2) + encodedParams5.slice(2)
  );
  const contract = await ContractFactory.deploy(poolParams, { gasLimit: 30000000 });
  console.log('pool deployed to:', contract.address);
  const runtimeBytecode = await ethers.provider.getCode(contract.address);
  fs.writeFileSync('./runtimeCode/runtimeBytecode.txt', runtimeBytecode.substring(2));
  const poolId = await contract.getPoolId();
  // const poolId2 = await xx.getPoolId();
  console.log('pool id', poolId);

  // console.log('pool id', poolId2);
  await erc20.approve(vault.address, ethers.utils.parseEther('1000000000'), deployer.address);
  await erc202.approve(vault.address, ethers.utils.parseEther('1000000000'), deployer.address);
  await erc203.approve(vault.address, ethers.utils.parseEther('1000000000'), deployer.address);
  console.log(' erc20 balance', bignumberToNumber(await erc20.balanceOf(deployer.address)));
  console.log(' erc202 balance', bignumberToNumber(await erc202.balanceOf(deployer.address)));
  console.log(' erc203 balance', bignumberToNumber(await erc203.balanceOf(deployer.address)));
  const allow = await erc20.allowance(deployer.address, vault.address);
  const allow1 = await erc202.allowance(deployer.address, vault.address);
  const allow2 = await erc203.allowance(deployer.address, vault.address);
  console.log('allow', bignumberToNumber(allow));
  console.log('allow1', bignumberToNumber(allow1));
  console.log('allow2', bignumberToNumber(allow2));

  const poolDetails = await vault.getPool(poolId);
  // await vault.setRelayerApproval(deployer.address, deployer.address, true);

  // console.log('token info', await vault.getPoolTokenInfo(poolId, erc20.address));
  let tokenInfo = await vault.getPoolTokens(poolId);
  // let tokenInfo = [
  //   [
  //     '0x07df10b89fa81334b29e54805d291cbcdd88cb52',
  //     '0x187055e8b7930e769cb10e2114889a51ddb3295e',
  //     '0x377cd88638963d45c8541509b70b9113c344d8b0',
  //   ],
  // ]; // get pool

  // const tokenInfo2 = await vault.getPoolTokens(poolId2);

  const getpool = await vault.getPool(poolId);
  console.log('get pool', getpool);
  console.log('pool token address', tokenInfo[0]);
  // console.log(tokenInfo2);
  // get pool id from contract
  let amountsIn = [];
  for (let i = 0; i < tokenInfo[0].length; i++) {
    if (tokenInfo[0][i] == contract.address) {
      amountsIn.push(ethers.utils.parseUnits('500000000', 18));
    } else {
      amountsIn.push(ethers.utils.parseUnits('500000000', 18));
    }
  }

  const txJoin = await vault.joinPool(
    poolId, // pool id
    deployer.address,
    deployer.address,
    {
      assets: tokenInfo[0],
      maxAmountsIn: [
        ethers.utils.parseEther('10000000000000000'),
        ethers.utils.parseEther('10000000000000000'),
        ethers.utils.parseEther('10000000000000000'),
        ethers.utils.parseEther('10000000000000000'),
      ],
      fromInternalBalance: false,
      userData: StablePoolEncoder.joinInit(amountsIn),
    },
    { gasLimit: 30000000 }
  );
  await txJoin.wait();
  console.log('bpt for deployer', await contract.balanceOf(deployer.address));
  console.log('pool info after iinit', await vault.getPoolTokens(poolId));
  // transfer erc20 to bob
  await erc20.transfer(bob.address, ethers.utils.parseEther('1000000'));
  await erc202.transfer(bob.address, ethers.utils.parseEther('1000000'));
  await erc203.transfer(bob.address, ethers.utils.parseEther('1000000'));
  await erc20.approve(vault.address, ethers.utils.parseEther('100000'), bob.address);
  console.log(
    'bob approve bytecode',
    await erc20.populateTransaction.approve(vault.address, ethers.utils.parseEther('100000'), deployer.address)
  );
  await erc202.approve(vault.address, ethers.utils.parseEther('100000'), bob.address);
  await erc203.approve(vault.address, ethers.utils.parseEther('100000'), bob.address);
  console.log('bob balance', bignumberToNumber(await erc20.balanceOf(bob.address)));
  console.log('bob balance', bignumberToNumber(await erc202.balanceOf(bob.address)));
  console.log('bpt bob balance', bignumberToNumber(await contract.balanceOf(bob.address)));
  const allowbob = await erc20.allowance(bob.address, vault.address);
  const allowbob1 = await erc202.allowance(bob.address, vault.address);
  const allowbob2 = await erc203.allowance(bob.address, vault.address);
  console.log('bob allow', bignumberToNumber(allowbob));
  console.log('bob allow1', bignumberToNumber(allowbob1));

  //  tokenInfo = [
  //   [
  //     '0x07df10b89fa81334b29e54805d291cbcdd88cb52',
  //     '0x187055e8b7930e769cb10e2114889a51ddb3295e',
  //     '0x377cd88638963d45c8541509b70b9113c344d8b0',
  //   ],
  // ]; // get pool
  let amountsInBob = [];
  let tokenInfoBob = [];
  let max = [];

  for (let i = 0; i < tokenInfo[0].length; i++) {
    if (tokenInfo[0][i] != contract.address) {
      tokenInfoBob.push(tokenInfo[0][i]);
      amountsInBob.push(ethers.utils.parseUnits('1000', 18));
      max.push(MAX_UINT256);
    } else {
      tokenInfoBob.push(tokenInfo[0][i]);
      max.push(MAX_UINT256);
    }
  }
  console.log(tokenInfo[0], tokenInfoBob, amountsInBob);

  const sender = ZERO_ADDRESS;
  const recipient = ZERO_ADDRESS;

  // const queryJoin = await balancerQueries.queryJoin(poolId, sender, recipient, {
  //   assets: tokenInfoBob,
  //   maxAmountsIn: [MAX_UINT256, MAX_UINT256, MAX_UINT256, MAX_UINT256],
  //   fromInternalBalance: false,
  //   userData: StablePoolEncoder.joinExactTokensInForBPTOut(
  //     [0, ethers.utils.parseUnits('1000', 18), ethers.utils.parseUnits('1000', 18)],
  //     0
  //   ),
  // });

  // console.log('estimated join amount out: ', queryJoin);
  const txJoinBob = await vault.joinPool(
    poolId, // pool id
    deployer.address,
    deployer.address,
    {
      assets: tokenInfoBob,
      maxAmountsIn: [MAX_UINT256, MAX_UINT256, MAX_UINT256, MAX_UINT256],
      fromInternalBalance: false,
      userData: StablePoolEncoder.joinExactTokensInForBPTOut(
        [0, ethers.utils.parseUnits('1000', 18), ethers.utils.parseUnits('1000', 18)],
        0
      ),
    }
  );
  await txJoinBob.wait();

  console.log('bob balance', bignumberToNumber(await erc20.balanceOf(bob.address)));
  console.log('bob balance', bignumberToNumber(await erc202.balanceOf(bob.address)));
  console.log('bpt bob balance', bignumberToNumber(await contract.balanceOf(deployer.address)));
  tokenInfo = await vault.getPoolTokens(poolId);

  console.log('pool balance', tokenInfo);
  console.log('bpt balance', bignumberToNumber(await contract.balanceOf(deployer.address)));

  console.log('erc20 balance', bignumberToNumber(await erc20.balanceOf(deployer.address)));
  console.log('erc202 balance', bignumberToNumber(await erc202.balanceOf(deployer.address)));

  let funds: FundManagement;
  funds = {
    sender: vault.address,
    recipient: ZERO_ADDRESS,
    fromInternalBalance: false,
    toInternalBalance: false,
  };
  // const swaps: BatchSwapStep[] = toSwaps(swapsData);
  // const deltas = await vault.queryBatchSwap(SwapKind.GivenIn, swaps, tokens.addresses, funds);
  // const sender = ZERO_ADDRESS;
  // const recipient = ZERO_ADDRESS;

  const amount = fp(10);
  const indexIn = 0;
  const indexOut = 1;

  const querySwap = await balancerQueries.querySwap(
    {
      poolId: poolId,
      kind: SwapKind.GivenIn,
      assetIn: erc20.address,
      assetOut: erc202.address,
      amount,
      userData: '0x',
    },
    funds
  );
  console.log('estimated swap amount out: ', querySwap);

  const swap = await vault.swap(
    {
      kind: SwapKind.GivenIn,
      poolId,
      assetIn: erc20.address,
      assetOut: erc202.address,
      amount: ethers.utils.parseUnits('10', 18),

      userData: '0x',
    },
    {
      sender: deployer.address,
      recipient: deployer.address,
      fromInternalBalance: false,
      toInternalBalance: false,
    },
    0,
    MAX_UINT256
  );
  await swap.wait();
  tokenInfo = await vault.getPoolTokens(poolId);
  console.log('pool balance after swap', tokenInfo[1]);
  console.log('after swap bpt balance', bignumberToNumber(await contract.balanceOf(deployer.address)));

  console.log('after swap erc20 balance', bignumberToNumber(await erc20.balanceOf(deployer.address)));
  console.log('after swap erc202 balance', bignumberToNumber(await erc202.balanceOf(deployer.address)));
  // amountsIn = [];
  // for (let i = 0; i < tokenInfo[0].length; i++) {
  //   if (tokenInfo[0][i] == contract.address) {
  //     amountsIn.push(ethers.utils.parseEther('1000'));
  //   } else {
  //     amountsIn.push(ethers.utils.parseEther('1000'));
  //   }
  // }
  // const txJoin1 = await vault.joinPool(poolId, deployer.address, deployer.address, {
  //   assets: [erc20.address, erc202.address],
  //   maxAmountsIn: [ethers.utils.parseEther('10000000000000000'), ethers.utils.parseEther('10000000000000000')],
  //   fromInternalBalance: false,
  //   userData: StablePoolEncoder.joinExactTokensInForBPTOut([ethers.utils.parseEther('10000'), ethers.utils.parseEther('10000')], ethers.utils.parseEther('100')),
  // });
  // console.log(await txJoin.wait);

  const queryExit = await balancerQueries.queryExit(poolId, sender, recipient, {
    assets: tokenInfo[0],
    minAmountsOut: [ethers.utils.parseEther('0'), ethers.utils.parseEther('0'), ethers.utils.parseEther('0')],
    userData: StablePoolEncoder.exitExactBptInForTokensOut(ethers.utils.parseEther('100000000')),
    toInternalBalance: false,
  });
  console.log('estimated exit amount out: ', queryExit);

  const txExit = await vault.exitPool(poolId, deployer.address, deployer.address, {
    assets: tokenInfo[0],
    minAmountsOut: [
      ethers.utils.parseEther('0'),
      ethers.utils.parseEther('0'),
      ethers.utils.parseEther('0'),
      ethers.utils.parseEther('0'),
    ],
    userData: StablePoolEncoder.exitExactBptInForTokensOut(ethers.utils.parseEther('100000000')),
    toInternalBalance: false,
  });
  console.log(await txExit.await);
  tokenInfo = await vault.getPoolTokens(poolId);
  console.log(tokenInfo);
  console.log('bpt balance', bignumberToNumber(await contract.balanceOf(deployer.address)));
  console.log('erc20 balance', bignumberToNumber(await erc20.balanceOf(deployer.address)));
  console.log('erc202 balance', bignumberToNumber(await erc202.balanceOf(deployer.address)));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
export function toBytes32(num: any) {
  let hex = num.toString(16); // Convert number to hexadecimal
  while (hex.length < 64) {
    // Pad with zeros until it's 64 characters (32 bytes)
    hex = '0' + hex;
  }
  return '0x' + hex;
}

export function bignumberToNumber(num: any) {
  return num.div(ethers.BigNumber.from(10).pow(18)).toNumber();
}

export const CHAINED_REFERENCE_TEMP_PREFIX = 'ba10'; // Temporary reference: it is deleted after a read.
export const CHAINED_REFERENCE_READONLY_PREFIX = 'ba11'; // Read-only reference: it is not deleted after a read.
export function toChainedReference(key: BigNumberish, isTemporary = true): BigNumber {
  const prefix = isTemporary ? CHAINED_REFERENCE_TEMP_PREFIX : CHAINED_REFERENCE_READONLY_PREFIX;
  // The full padded prefix is 66 characters long, with 64 hex characters and the 0x prefix.
  const paddedPrefix = `0x${prefix}${'0'.repeat(64 - prefix.length)}`;

  return BigNumber.from(paddedPrefix).add(key);
}

export interface Input {
  dumpPath: string;
  owner: string;
  vault: string;
  protocol: string;
  erc20: string;
  erc201: string;
  rateProvider: string;
  rateProvider1: string;
  authorizer: string;
  weth: string;
  approveCall: ApproveCall;
  TokenListByPoolIdCall: TokenListByPoolIDCall;
  initPoolCall: InitPoolCall;
  joinPoolCall: JoinPoolCall;
}

export interface TokenListByPoolIDCall {
  poolId: string;
}

export interface ApproveCall {
  amount: string;
}

export interface InitPoolCall {
  tokenInfo: string[];
  maxAmountsIn: string[];
  amountsIn: string[];
  address: string;
}

export interface JoinPoolCall {
  amountsIn: string[];
  maxAmountsIn: string[];
  tokenInfo: string[];
  address: string;
}
