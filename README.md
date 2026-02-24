# Battleship Game
On-chain game heavily inspired by the classic board game Battleships. Players are presented with a grid and select squares to try to sink as many of the ships as possible.
Each successful hit or ship sinking is rewarded with ETH.

![In-game screenshot](./public/screenshot.png)

## Local environment setup.

### Set environment variables

Create an .env file in the root of the application directory

```shell
touch .env.development
```


Add the following env vars....

```
USER_KEY=<KEY>
PRIVATE_KEY=<KEY>
VITE_CONTRACT_ADDRESS=<CONTRACT ADDRESS>
VITE_ZEN_API=https://faucet.ten.xyz

```
-   Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
-   Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
-   Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

## Deploying Battleships

After deploying the contract, send ETH to the contract address to fund the prize pool for rewards.

### Install dependencies

`npm ci`

### Run dev environment

`npm run dev`

