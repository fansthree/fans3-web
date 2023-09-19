## Install

```sh
npm i -g pnpm
pnpm i
pnpm --filter @fans3/app dev
```

## Settings

### VSCode

### Environments

```sh
npm i -g pnpm
pnpm i
```

### VSCode Settings

Required Plugins: `lit-html`, `Prettier`

Open Workspace from File: `./fans3.code-workspace`

## Publish

```sh
# clone for the first time
git clone git@github.com:fansthree/demo.git apps/app/dist
# build every time
pnpm --filter @fans3/app build
# add changes
git -C apps/app/dist add .
# commit changes
git -C apps/app/dist commit -m "Update"
# push changes
git -C apps/app/dist push
```
