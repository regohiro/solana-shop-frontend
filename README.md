# Solana Shop Interface

## Local developement
1. Clone this repo and install dependencies

2. Setup certificate to run on https. This is required when accessing website from mobile.
```
openssl req -x509 -out ./certificates/localhost.crt -keyout ./certificates/localhost.key \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=localhost' -extensions EXT -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
```

3. Create .env and fill everything according to .env.example
```
cp .env.example .env
vim .env
```

4. Develop
```
yarn dev
yarn dev:https
```

5. Build
```
yarn build
```

6. Start
```
yarn start
yarn start:https
```