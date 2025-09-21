---
title: MEVless, A Solution to MEV
date: 2025-09-21
categories:
  - Tech Thoughts
tags: [Blockchain, MEV]
cover: https://lawliet-chan.github.io/images/break_sandwich.png
---

## What is MEV

MEV attacks (Maximum Extractable Value attacks) are blockchain behaviors that exploit control over transaction ordering to extract additional profits by reordering, inserting, or excluding specific transactions.

The most common form is sandwich attacks, where attackers insert their own transactions before and after a user's buy transaction, using price manipulation to achieve arbitrage, causing users to pay higher prices. Other forms include front-running attacks and liquidation arbitrage.

It should be noted that sandwich attacks and front-running attacks are essentially harmful to the blockchain ecosystem with no benefits. They cause users' trading profits to be damaged for the attackers' own benefit, which is different from triangular arbitrage. Triangular arbitrage itself can bring liquidity to the blockchain, while sandwich attacks and front-running attacks damage liquidity. When no transactions occur, these two types of attacks disappear accordingly. It can be seen that sandwich attacks and front-running attacks have extremely negative effects on blockchain (especially DeFi), making them industry cancers.

## MEVless Protocol

### Prerequisites

MEVless applicable attack scenarios:
- Sandwich attacks
- Front-running attacks

MEVless applicable chains:
Here, the author does not recommend using the MEVless protocol at the L1 public chain level (especially general-purpose blockchains like ETH and Solana), because MEVless requires targeted modifications to the blocks themselves, which are specifically designed to resist MEV and may not be suitable for other business types (especially those that don't need MEV resistance). The author recommends placing MEVless on dedicated DeFi application chains or L2s, and then returning to ETH L1 for settlement.

### Principle

The principle of MEVless lies in constraining miners' behavior in transaction ordering. Our approach is to prevent miners from seeing specific transaction content during ordering. Transactions are ordered without miners seeing the transaction content, so even miners cannot perform MEV attacks since they don't know the specific transaction content. After ordering, the sequence needs to be published to the public network so other nodes and users are informed. At this point, the transaction order is finalized and included in the block, so when specific transaction content is submitted later, it will be executed according to this consensus order, with no room for MEV operations.

We divide on-chain blocks into two types:
- Ordering blocks, which only complete three things: receiving transaction hashes, deducting user prepayments, and providing transaction ordering commitments
- Execution blocks, which are no different from ordinary blocks, only need to execute transactions according to the order committed in the previous ordering block

These two types of blocks are produced alternately. For example, after the genesis block, blocks with odd block heights are ordering blocks, and blocks with even block heights are execution blocks.

### Process

![MEVless Process](https://lawliet-chan.github.io/images/MEVless.png)

1. Block N (ordering block) begins block production
2. Users send transaction hashes to the chain and pay a certain prepayment. The prepayment consists of two parts:
   1) Gas fee for transaction hash: Used for storage of transaction hash and computation fees during ordering. This fee is generally fixed and mandatory
   2) Additional tip: Extra fee paid by users to ensure their transaction can be ordered as early as possible. This amount is not fixed and can be zero
3. After the chain nodes receive transaction hashes, they will complete the following steps:
   - Check if the transaction account has sufficient funds to pay the prepayment
   - Sort transaction hashes from high to low based on prepayment amount
   - Deduct the prepayment amount from the transaction account
   - Store the sorted transaction order as a commitment in the block and publish it to the P2P network
4. After users subscribe and query to see the ordering sequence number of their transaction hash committed on-chain, they send specific transaction content to the chain and DA (DA is optional)
5. Block N+1 (execution block) begins block production
6. After chain nodes receive transaction content, they will complete the following steps:
   - Pull transaction content from DA (if all txHashes committed to ordering in the previous block have corresponding transaction content, skip this step)
   - Check if the transaction content matches the previously committed ordering txHash, discard if not matching
   - Execute transactions according to the previously committed order

This process continues cyclically.

### Role of DA (Optional)

In this scheme, it may happen that after transaction content is sent to the chain, miners see that the transaction is profitable and may maliciously withhold the transaction to prevent it from being included on-chain, then wait for users to resend the same transaction for attack. At this time, not only will users' transaction profits still be eroded, but they will also waste a prepayment for the previously sent transaction hash.

Therefore, we need DA (such as ETH Blob) to ensure that transactions sent by users will definitely be included on-chain. This way, even if block-producing nodes maliciously withhold the transaction, other verification nodes and full nodes can still receive the transaction content and execute the transaction in subsequent block production processes. This forces block-producing nodes to include the transaction in their blocks to prevent state inconsistency with other nodes.

In this process, DA provides an additional layer of protection for users and is not mandatory. If users feel that the transaction has been sufficiently propagated to enough full nodes in the P2P network, they can choose not to use DA. Introducing DA can also prevent miners on the chain from jointly monopolizing and withholding user transactions.

## Advantages

1. Compared to encrypted mempools, the MEVless solution has lower overhead, requiring no decryption operations that are energy-intensive for CPU and memory. MEVless only orders transaction hashes first, with a hash being only 32 bytes long (or even shorter). After ordering is complete, propagation places minimal burden on network bandwidth.

2. Compared to PBS, MEVless constrains from the source of MEV attacks - transaction ordering rights - by blocking attackers' access to transaction information before ordering, eliminating the prerequisite for attackers to perform MEV attacks.

3. Conducive to decentralized execution and verifiable results. All MEV resistance methods and steps are hardcoded at the code level. As long as full nodes execute according to this code, the results are deterministic, making it difficult to perform MEV attacks in black box operations.
