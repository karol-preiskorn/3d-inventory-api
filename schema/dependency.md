3d-inventory-mongo-api@1.0.8 /home/karol/GitHub/3d-inventory-mongo-api
├─┬ @apollo/client@3.8.8
│ ├─┬ @graphql-typed-document-node/core@3.2.0
│ │ └── graphql@16.8.1 deduped
│ ├─┬ @wry/equality@0.5.7
│ │ └── tslib@2.6.2 deduped
│ ├─┬ @wry/trie@0.5.0
│ │ └── tslib@2.6.2 deduped
│ ├─┬ graphql-tag@2.12.6
│ │ ├── graphql@16.8.1 deduped
│ │ └── tslib@2.6.2 deduped
│ ├── UNMET OPTIONAL DEPENDENCY graphql-ws@^5.5.5
│ ├── graphql@16.8.1 deduped
│ ├─┬ hoist-non-react-statics@3.3.2
│ │ └── react-is@16.13.1
│ ├─┬ optimism@0.18.0
│ │ ├─┬ @wry/caches@1.0.1
│ │ │ └── tslib@2.6.2 deduped
│ │ ├─┬ @wry/context@0.7.4
│ │ │ └── tslib@2.6.2 deduped
│ │ ├─┬ @wry/trie@0.4.3
│ │ │ └── tslib@2.6.2 deduped
│ │ └── tslib@2.6.2 deduped
│ ├─┬ prop-types@15.8.1
│ │ ├─┬ loose-envify@1.4.0
│ │ │ └── js-tokens@4.0.0
│ │ ├── object-assign@4.1.1 deduped
│ │ └── react-is@16.13.1
│ ├── UNMET OPTIONAL DEPENDENCY react-dom@^16.8.0 || ^17.0.0 || ^18.0.0
│ ├── UNMET OPTIONAL DEPENDENCY react@^16.8.0 || ^17.0.0 || ^18.0.0
│ ├── response-iterator@0.2.6
│ ├── UNMET OPTIONAL DEPENDENCY subscriptions-transport-ws@^0.9.0 || ^0.11.0
│ ├── symbol-observable@4.0.0
│ ├─┬ ts-invariant@0.10.3
│ │ └── tslib@2.6.2 deduped
│ ├── tslib@2.6.2
│ └─┬ zen-observable-ts@1.2.5
│ └── zen-observable@0.8.15
├─┬ @shelf/jest-mongodb@4.2.0
│ ├─┬ debug@4.3.4
│ │ └── ms@2.1.2 deduped
│ ├─┬ jest-environment-node@29.7.0
│ │ ├─┬ @jest/environment@29.7.0
│ │ │ ├── @jest/fake-timers@29.7.0 deduped
│ │ │ ├── @jest/types@29.6.3 deduped
│ │ │ ├── @types/node@20.10.0 deduped
│ │ │ └── jest-mock@29.7.0 deduped
│ │ ├─┬ @jest/fake-timers@29.7.0
│ │ │ ├── @jest/types@29.6.3 deduped
│ │ │ ├─┬ @sinonjs/fake-timers@10.3.0
│ │ │ │ └─┬ @sinonjs/commons@3.0.0
│ │ │ │ └── type-detect@4.0.8 deduped
│ │ │ ├── @types/node@20.10.0 deduped
│ │ │ ├── jest-message-util@29.7.0 deduped
│ │ │ ├── jest-mock@29.7.0 deduped
│ │ │ └── jest-util@29.7.0 deduped
│ │ ├── @jest/types@29.6.3 deduped
│ │ ├── @types/node@20.10.0 deduped
│ │ ├─┬ jest-mock@29.7.0
│ │ │ ├── @jest/types@29.6.3 deduped
│ │ │ ├── @types/node@20.10.0 deduped
│ │ │ └── jest-util@29.7.0 deduped
│ │ └── jest-util@29.7.0 deduped
│ ├─┬ mongodb-memory-server@9.1.1
│ │ ├─┬ mongodb-memory-server-core@9.1.1
│ │ │ ├─┬ async-mutex@0.4.0
│ │ │ │ └── tslib@2.6.2 deduped
│ │ │ ├── camelcase@6.3.0
│ │ │ ├── debug@4.3.4 deduped
│ │ │ ├─┬ find-cache-dir@3.3.2
│ │ │ │ ├── commondir@1.0.1
│ │ │ │ ├─┬ make-dir@3.1.0
│ │ │ │ │ └── semver@6.3.1
│ │ │ │ └── pkg-dir@4.2.0 deduped
│ │ │ ├── follow-redirects@1.15.3
│ │ │ ├─┬ https-proxy-agent@7.0.2
│ │ │ │ ├─┬ agent-base@7.1.0
│ │ │ │ │ └── debug@4.3.4 deduped
│ │ │ │ └── debug@4.3.4 deduped
│ │ │ ├─┬ mongodb@5.9.1
│ │ │ │ ├── UNMET OPTIONAL DEPENDENCY @aws-sdk/credential-providers@^3.188.0
│ │ │ │ ├── @mongodb-js/saslprep@1.1.1 deduped
│ │ │ │ ├── UNMET OPTIONAL DEPENDENCY @mongodb-js/zstd@^1.0.0
│ │ │ │ ├── bson@5.5.1
│ │ │ │ ├── UNMET OPTIONAL DEPENDENCY kerberos@^1.0.0 || ^2.0.0
│ │ │ │ ├── UNMET OPTIONAL DEPENDENCY mongodb-client-encryption@>=2.3.0 <3
│ │ │ │ ├─┬ mongodb-connection-string-url@2.6.0
│ │ │ │ │ ├─┬ @types/whatwg-url@8.2.2
│ │ │ │ │ │ ├── @types/node@20.10.0 deduped
│ │ │ │ │ │ └── @types/webidl-conversions@7.0.3 deduped
│ │ │ │ │ └─┬ whatwg-url@11.0.0
│ │ │ │ │ ├─┬ tr46@3.0.0
│ │ │ │ │ │ └── punycode@2.3.1 deduped
│ │ │ │ │ └── webidl-conversions@7.0.0 deduped
│ │ │ │ ├── UNMET OPTIONAL DEPENDENCY snappy@^7.2.2
│ │ │ │ └── socks@2.7.1 deduped
│ │ │ ├─┬ new-find-package-json@2.0.0
│ │ │ │ └── debug@4.3.4 deduped
│ │ │ ├── semver@7.5.4 deduped
│ │ │ ├─┬ tar-stream@3.1.6
│ │ │ │ ├── b4a@1.6.4
│ │ │ │ ├── fast-fifo@1.3.2
│ │ │ │ └─┬ streamx@2.15.5
│ │ │ │ ├── fast-fifo@1.3.2 deduped
│ │ │ │ └── queue-tick@1.0.1
│ │ │ ├── tslib@2.6.2 deduped
│ │ │ └─┬ yauzl@2.10.0
│ │ │ ├── buffer-crc32@0.2.13
│ │ │ └─┬ fd-slicer@1.1.0
│ │ │ └── pend@1.2.0
│ │ └── tslib@2.6.2 deduped
│ └── mongodb@6.3.0 deduped
├── @types/async@3.2.24
├── @types/bcrypt-nodejs@0.0.31
├── @types/bluebird@3.5.42
├─┬ @types/body-parser@1.19.5
│ ├─┬ @types/connect@3.4.38
│ │ └── @types/node@20.10.0 deduped
│ └── @types/node@20.10.0 deduped
├── @types/chai@4.3.11
├─┬ @types/compression@1.7.5
│ └── @types/express@4.17.21 deduped
├─┬ @types/errorhandler@1.5.3
│ └── @types/express@4.17.21 deduped
├─┬ @types/eslint@8.44.7
│ ├── @types/estree@1.0.5
│ └── @types/json-schema@7.0.15
├─┬ @types/express-flash@0.0.5
│ └── @types/express@4.17.21 deduped
├─┬ @types/express-session@1.17.10
│ └── @types/express@4.17.21 deduped
├─┬ @types/express@4.17.21
│ ├── @types/body-parser@1.19.5 deduped
│ ├─┬ @types/express-serve-static-core@4.17.41
│ │ ├── @types/node@20.10.0 deduped
│ │ ├── @types/qs@6.9.10 deduped
│ │ ├── @types/range-parser@1.2.7
│ │ └─┬ @types/send@0.17.4
│ │ ├── @types/mime@1.3.5 deduped
│ │ └── @types/node@20.10.0 deduped
│ ├── @types/qs@6.9.10
│ └─┬ @types/serve-static@1.15.5
│ ├── @types/http-errors@2.0.4
│ ├── @types/mime@1.3.5
│ └── @types/node@20.10.0 deduped
├── @types/figlet@1.5.8
├─┬ @types/jest@29.5.10
│ ├─┬ expect@29.7.0
│ │ ├─┬ @jest/expect-utils@29.7.0
│ │ │ └── jest-get-type@29.6.3 deduped
│ │ ├── jest-get-type@29.6.3
│ │ ├─┬ jest-matcher-utils@29.7.0
│ │ │ ├─┬ chalk@4.1.2
│ │ │ │ ├─┬ ansi-styles@4.3.0
│ │ │ │ │ └─┬ color-convert@2.0.1
│ │ │ │ │ └── color-name@1.1.4
│ │ │ │ └─┬ supports-color@7.2.0
│ │ │ │ └── has-flag@4.0.0
│ │ │ ├─┬ jest-diff@29.7.0
│ │ │ │ ├─┬ chalk@4.1.2
│ │ │ │ │ ├─┬ ansi-styles@4.3.0
│ │ │ │ │ │ └─┬ color-convert@2.0.1
│ │ │ │ │ │ └── color-name@1.1.4
│ │ │ │ │ └─┬ supports-color@7.2.0
│ │ │ │ │ └── has-flag@4.0.0
│ │ │ │ ├── diff-sequences@29.6.3
│ │ │ │ ├── jest-get-type@29.6.3 deduped
│ │ │ │ └── pretty-format@29.7.0 deduped
│ │ │ ├── jest-get-type@29.6.3 deduped
│ │ │ └── pretty-format@29.7.0 deduped
│ │ ├─┬ jest-message-util@29.7.0
│ │ │ ├── @babel/code-frame@7.23.4 deduped
│ │ │ ├── @jest/types@29.6.3 deduped
│ │ │ ├── @types/stack-utils@2.0.3
│ │ │ ├─┬ chalk@4.1.2
│ │ │ │ ├─┬ ansi-styles@4.3.0
│ │ │ │ │ └─┬ color-convert@2.0.1
│ │ │ │ │ └── color-name@1.1.4
│ │ │ │ └─┬ supports-color@7.2.0
│ │ │ │ └── has-flag@4.0.0
│ │ │ ├── graceful-fs@4.2.11 deduped
│ │ │ ├── micromatch@4.0.5 deduped
│ │ │ ├── pretty-format@29.7.0 deduped
│ │ │ ├── slash@3.0.0
│ │ │ └─┬ stack-utils@2.0.6
│ │ │ └── escape-string-regexp@2.0.0
│ │ └── jest-util@29.7.0 deduped
│ └── pretty-format@29.7.0 deduped
├─┬ @types/jquery@3.5.29
│ └── @types/sizzle@2.3.8
├── @types/lodash@4.14.202
├─┬ @types/lusca@1.7.4
│ └── @types/express@4.17.21 deduped
├─┬ @types/node@20.10.0
│ └── undici-types@5.26.5
├─┬ @types/nodemailer@6.4.14
│ └── @types/node@20.10.0 deduped
├─┬ @types/passport-facebook@3.0.3
│ ├── @types/express@4.17.21 deduped
│ ├─┬ @types/passport-oauth2@1.4.15
│ │ ├── @types/express@4.17.21 deduped
│ │ ├─┬ @types/oauth@0.9.4
│ │ │ └── @types/node@20.10.0 deduped
│ │ └── @types/passport@1.0.16 deduped
│ └── @types/passport@1.0.16 deduped
├─┬ @types/passport-local@1.0.38
│ ├── @types/express@4.17.21 deduped
│ ├─┬ @types/passport-strategy@0.2.38
│ │ ├── @types/express@4.17.21 deduped
│ │ └── @types/passport@1.0.16 deduped
│ └── @types/passport@1.0.16 deduped
├─┬ @types/passport@1.0.16
│ └── @types/express@4.17.21 deduped
├── @types/pug@2.0.10
├─┬ @types/request-promise@4.1.51
│ ├── @types/bluebird@3.5.42 deduped
│ └── @types/request@2.48.12 deduped
├─┬ @types/request@2.48.12
│ ├── @types/caseless@0.12.5
│ ├── @types/node@20.10.0 deduped
│ ├── @types/tough-cookie@4.0.5
│ └─┬ form-data@2.5.1
│ ├── asynckit@0.4.0
│ ├─┬ combined-stream@1.0.8
│ │ └── delayed-stream@1.0.0
│ └─┬ mime-types@2.1.35
│ └── mime-db@1.52.0 deduped
├── @types/semver@7.5.6
├─┬ @types/shelljs@0.8.15
│ ├─┬ @types/glob@7.2.0
│ │ ├── @types/minimatch@5.1.2
│ │ └── @types/node@20.10.0 deduped
│ └── @types/node@20.10.0 deduped
├─┬ @types/supertest@2.0.16
│ └─┬ @types/superagent@4.1.24
│ ├── @types/cookiejar@2.1.5
│ └── @types/node@20.10.0 deduped
├─┬ @typescript-eslint/eslint-plugin@6.13.1
│ ├── @eslint-community/regexpp@4.10.0
│ ├── @typescript-eslint/parser@6.13.1 deduped
│ ├─┬ @typescript-eslint/scope-manager@6.13.1
│ │ ├── @typescript-eslint/types@6.13.1 deduped
│ │ └── @typescript-eslint/visitor-keys@6.13.1 deduped
│ ├─┬ @typescript-eslint/type-utils@6.13.1
│ │ ├── @typescript-eslint/typescript-estree@6.13.1 deduped
│ │ ├── @typescript-eslint/utils@6.13.1 deduped
│ │ ├── debug@4.3.4 deduped
│ │ ├── eslint@8.54.0 deduped
│ │ └── ts-api-utils@1.0.3 deduped
│ ├─┬ @typescript-eslint/utils@6.13.1
│ │ ├── @eslint-community/eslint-utils@4.4.0 deduped
│ │ ├── @types/json-schema@7.0.15 deduped
│ │ ├── @types/semver@7.5.6 deduped
│ │ ├── @typescript-eslint/scope-manager@6.13.1 deduped
│ │ ├── @typescript-eslint/types@6.13.1 deduped
│ │ ├── @typescript-eslint/typescript-estree@6.13.1 deduped
│ │ ├── eslint@8.54.0 deduped
│ │ └── semver@7.5.4 deduped
│ ├─┬ @typescript-eslint/visitor-keys@6.13.1
│ │ ├── @typescript-eslint/types@6.13.1 deduped
│ │ └── eslint-visitor-keys@3.4.3 deduped
│ ├── debug@4.3.4 deduped
│ ├── eslint@8.54.0 deduped
│ ├── graphemer@1.4.0
│ ├── ignore@5.3.0
│ ├── natural-compare@1.4.0
│ ├── semver@7.5.4 deduped
│ └─┬ ts-api-utils@1.0.3
│ └── typescript@5.3.2 deduped
├─┬ @typescript-eslint/parser@6.13.1
│ ├── @typescript-eslint/scope-manager@6.13.1 deduped
│ ├── @typescript-eslint/types@6.13.1
│ ├─┬ @typescript-eslint/typescript-estree@6.13.1
│ │ ├── @typescript-eslint/types@6.13.1 deduped
│ │ ├── @typescript-eslint/visitor-keys@6.13.1 deduped
│ │ ├── debug@4.3.4 deduped
│ │ ├── globby@11.1.0 deduped
│ │ ├── is-glob@4.0.3 deduped
│ │ ├── semver@7.5.4 deduped
│ │ └── ts-api-utils@1.0.3 deduped
│ ├── @typescript-eslint/visitor-keys@6.13.1 deduped
│ ├── debug@4.3.4 deduped
│ └── eslint@8.54.0 deduped
├── async@3.2.5
├── bcrypt-nodejs@0.0.3
├── bcryptjs@2.4.3
├── bluebird@3.7.2
├─┬ body-parser@1.20.2
│ ├── bytes@3.1.2
│ ├── content-type@1.0.5
│ ├─┬ debug@2.6.9
│ │ └── ms@2.0.0
│ ├── depd@2.0.0
│ ├── destroy@1.2.0
│ ├─┬ http-errors@2.0.0
│ │ ├── depd@2.0.0 deduped
│ │ ├── inherits@2.0.4
│ │ ├── setprototypeof@1.2.0 deduped
│ │ ├── statuses@2.0.1 deduped
│ │ └── toidentifier@1.0.1
│ ├─┬ iconv-lite@0.4.24
│ │ └── safer-buffer@2.1.2
│ ├─┬ on-finished@2.4.1
│ │ └── ee-first@1.1.1
│ ├─┬ qs@6.11.0
│ │ └─┬ side-channel@1.0.4
│ │ ├── call-bind@1.0.5 deduped
│ │ ├── get-intrinsic@1.2.2 deduped
│ │ └── object-inspect@1.13.1
│ ├─┬ raw-body@2.5.2
│ │ ├── bytes@3.1.2 deduped
│ │ ├── http-errors@2.0.0 deduped
│ │ ├── iconv-lite@0.4.24 deduped
│ │ └── unpipe@1.0.0 deduped
│ ├─┬ type-is@1.6.18
│ │ ├── media-typer@0.3.0
│ │ └── mime-types@2.1.35 deduped
│ └── unpipe@1.0.0
├─┬ bootstrap@5.3.2
│ └── @popperjs/core@2.11.8
├─┬ chai@4.3.10
│ ├── assertion-error@1.1.0
│ ├─┬ check-error@1.0.3
│ │ └── get-func-name@2.0.2 deduped
│ ├─┬ deep-eql@4.1.3
│ │ └── type-detect@4.0.8 deduped
│ ├── get-func-name@2.0.2
│ ├─┬ loupe@2.3.7
│ │ └── get-func-name@2.0.2 deduped
│ ├── pathval@1.1.1
│ └── type-detect@4.0.8
├─┬ compression@1.7.4
│ ├─┬ accepts@1.3.8
│ │ ├── mime-types@2.1.35 deduped
│ │ └── negotiator@0.6.3
│ ├── bytes@3.0.0
│ ├─┬ compressible@2.0.18
│ │ └── mime-db@1.52.0
│ ├─┬ debug@2.6.9
│ │ └── ms@2.0.0
│ ├── on-headers@1.0.2
│ ├── safe-buffer@5.1.2
│ └── vary@1.1.2
├─┬ concurrently@8.2.2
│ ├─┬ chalk@4.1.2
│ │ ├─┬ ansi-styles@4.3.0
│ │ │ └─┬ color-convert@2.0.1
│ │ │ └── color-name@1.1.4
│ │ └─┬ supports-color@7.2.0
│ │ └── has-flag@4.0.0 deduped
│ ├─┬ date-fns@2.30.0
│ │ └─┬ @babel/runtime@7.23.4
│ │ └── regenerator-runtime@0.14.0
│ ├── lodash@4.17.21 deduped
│ ├─┬ rxjs@7.8.1
│ │ └── tslib@2.6.2 deduped
│ ├── shell-quote@1.8.1
│ ├── spawn-command@0.0.2
│ ├─┬ supports-color@8.1.1
│ │ └── has-flag@4.0.0
│ ├── tree-kill@1.2.2
│ └─┬ yargs@17.7.2
│ ├─┬ cliui@8.0.1
│ │ ├── string-width@4.2.3 deduped
│ │ ├── strip-ansi@6.0.1 deduped
│ │ └─┬ wrap-ansi@7.0.0
│ │ ├─┬ ansi-styles@4.3.0
│ │ │ └─┬ color-convert@2.0.1
│ │ │ └── color-name@1.1.4
│ │ ├── string-width@4.2.3 deduped
│ │ └── strip-ansi@6.0.1 deduped
│ ├── escalade@3.1.1
│ ├── get-caller-file@2.0.5
│ ├── require-directory@2.1.1
│ ├─┬ string-width@4.2.3
│ │ ├── emoji-regex@8.0.0
│ │ ├── is-fullwidth-code-point@3.0.0
│ │ └── strip-ansi@6.0.1 deduped
│ ├── y18n@5.0.8
│ └── yargs-parser@21.1.1 deduped
├─┬ connect-mongo@5.1.0
│ ├── debug@4.3.4 deduped
│ ├── express-session@1.17.3 deduped
│ ├─┬ kruptein@3.0.6
│ │ └─┬ asn1.js@5.4.1
│ │ ├── bn.js@4.12.0
│ │ ├── inherits@2.0.4 deduped
│ │ ├── minimalistic-assert@1.0.1
│ │ └── safer-buffer@2.1.2 deduped
│ └── mongodb@6.3.0 deduped
├─┬ cookie-session@2.0.0
│ ├─┬ cookies@0.8.0
│ │ ├── depd@2.0.0 deduped
│ │ └─┬ keygrip@1.1.0
│ │ └── tsscmp@1.0.6 deduped
│ ├─┬ debug@3.2.7
│ │ └── ms@2.1.2 deduped
│ ├── on-headers@1.0.2 deduped
│ └── safe-buffer@5.2.1
├─┬ cors@2.8.5
│ ├── object-assign@4.1.1
│ └── vary@1.1.2 deduped
├── dotenv@16.3.1
├─┬ errorhandler@1.5.1
│ ├── accepts@1.3.8 deduped
│ └── escape-html@1.0.3
├─┬ eslint-config-prettier@9.0.0
│ └── eslint@8.54.0 deduped
├─┬ eslint-config-standard@17.1.0
│ ├── eslint-plugin-import@2.29.0 deduped
│ ├─┬ eslint-plugin-n@16.3.1
│ │ ├── @eslint-community/eslint-utils@4.4.0 deduped
│ │ ├─┬ builtins@5.0.1
│ │ │ └── semver@7.5.4 deduped
│ │ ├─┬ eslint-plugin-es-x@7.4.0
│ │ │ ├── @eslint-community/eslint-utils@4.4.0 deduped
│ │ │ ├── @eslint-community/regexpp@4.10.0 deduped
│ │ │ ├─┬ eslint-compat-utils@0.1.2
│ │ │ │ └── eslint@8.54.0 deduped
│ │ │ └── eslint@8.54.0 deduped
│ │ ├── eslint@8.54.0 deduped
│ │ ├─┬ get-tsconfig@4.7.2
│ │ │ └── resolve-pkg-maps@1.0.0
│ │ ├── ignore@5.3.0 deduped
│ │ ├─┬ is-builtin-module@3.2.1
│ │ │ └── builtin-modules@3.3.0
│ │ ├── is-core-module@2.13.1 deduped
│ │ ├── minimatch@3.1.2 deduped
│ │ ├── resolve@1.22.8 deduped
│ │ └── semver@7.5.4 deduped
│ ├─┬ eslint-plugin-promise@6.1.1
│ │ └── eslint@8.54.0 deduped
│ └── eslint@8.54.0 deduped
├─┬ eslint-plugin-import@2.29.0
│ ├─┬ array-includes@3.1.7
│ │ ├─┬ call-bind@1.0.5
│ │ │ ├── function-bind@1.1.2 deduped
│ │ │ ├── get-intrinsic@1.2.2 deduped
│ │ │ └─┬ set-function-length@1.1.1
│ │ │ ├── define-data-property@1.1.1 deduped
│ │ │ ├── get-intrinsic@1.2.2 deduped
│ │ │ ├── gopd@1.0.1 deduped
│ │ │ └── has-property-descriptors@1.0.1 deduped
│ │ ├─┬ define-properties@1.2.1
│ │ │ ├─┬ define-data-property@1.1.1
│ │ │ │ ├── get-intrinsic@1.2.2 deduped
│ │ │ │ ├── gopd@1.0.1 deduped
│ │ │ │ └── has-property-descriptors@1.0.1 deduped
│ │ │ ├─┬ has-property-descriptors@1.0.1
│ │ │ │ └── get-intrinsic@1.2.2 deduped
│ │ │ └── object-keys@1.1.1
│ │ ├─┬ es-abstract@1.22.3
│ │ │ ├─┬ array-buffer-byte-length@1.0.0
│ │ │ │ ├── call-bind@1.0.5 deduped
│ │ │ │ └── is-array-buffer@3.0.2 deduped
│ │ │ ├─┬ arraybuffer.prototype.slice@1.0.2
│ │ │ │ ├── array-buffer-byte-length@1.0.0 deduped
│ │ │ │ ├── call-bind@1.0.5 deduped
│ │ │ │ ├── define-properties@1.2.1 deduped
│ │ │ │ ├── es-abstract@1.22.3 deduped
│ │ │ │ ├── get-intrinsic@1.2.2 deduped
│ │ │ │ ├── is-array-buffer@3.0.2 deduped
│ │ │ │ └── is-shared-array-buffer@1.0.2 deduped
│ │ │ ├── available-typed-arrays@1.0.5
│ │ │ ├── call-bind@1.0.5 deduped
│ │ │ ├─┬ es-set-tostringtag@2.0.2
│ │ │ │ ├── get-intrinsic@1.2.2 deduped
│ │ │ │ ├── has-tostringtag@1.0.0 deduped
│ │ │ │ └── hasown@2.0.0 deduped
│ │ │ ├─┬ es-to-primitive@1.2.1
│ │ │ │ ├── is-callable@1.2.7 deduped
│ │ │ │ ├─┬ is-date-object@1.0.5
│ │ │ │ │ └── has-tostringtag@1.0.0 deduped
│ │ │ │ └─┬ is-symbol@1.0.4
│ │ │ │ └── has-symbols@1.0.3 deduped
│ │ │ ├─┬ function.prototype.name@1.1.6
│ │ │ │ ├── call-bind@1.0.5 deduped
│ │ │ │ ├── define-properties@1.2.1 deduped
│ │ │ │ ├── es-abstract@1.22.3 deduped
│ │ │ │ └── functions-have-names@1.2.3
│ │ │ ├── get-intrinsic@1.2.2 deduped
│ │ │ ├─┬ get-symbol-description@1.0.0
│ │ │ │ ├── call-bind@1.0.5 deduped
│ │ │ │ └── get-intrinsic@1.2.2 deduped
│ │ │ ├─┬ globalthis@1.0.3
│ │ │ │ └── define-properties@1.2.1 deduped
│ │ │ ├─┬ gopd@1.0.1
│ │ │ │ └── get-intrinsic@1.2.2 deduped
│ │ │ ├── has-property-descriptors@1.0.1 deduped
│ │ │ ├── has-proto@1.0.1
│ │ │ ├── has-symbols@1.0.3
│ │ │ ├── hasown@2.0.0 deduped
│ │ │ ├─┬ internal-slot@1.0.6
│ │ │ │ ├── get-intrinsic@1.2.2 deduped
│ │ │ │ ├── hasown@2.0.0 deduped
│ │ │ │ └── side-channel@1.0.4 deduped
│ │ │ ├─┬ is-array-buffer@3.0.2
│ │ │ │ ├── call-bind@1.0.5 deduped
│ │ │ │ ├── get-intrinsic@1.2.2 deduped
│ │ │ │ └── is-typed-array@1.1.12 deduped
│ │ │ ├── is-callable@1.2.7
│ │ │ ├── is-negative-zero@2.0.2
│ │ │ ├─┬ is-regex@1.1.4
│ │ │ │ ├── call-bind@1.0.5 deduped
│ │ │ │ └── has-tostringtag@1.0.0 deduped
│ │ │ ├─┬ is-shared-array-buffer@1.0.2
│ │ │ │ └── call-bind@1.0.5 deduped
│ │ │ ├── is-string@1.0.7 deduped
│ │ │ ├─┬ is-typed-array@1.1.12
│ │ │ │ └── which-typed-array@1.1.13 deduped
│ │ │ ├─┬ is-weakref@1.0.2
│ │ │ │ └── call-bind@1.0.5 deduped
│ │ │ ├── object-inspect@1.13.1 deduped
│ │ │ ├── object-keys@1.1.1 deduped
│ │ │ ├─┬ object.assign@4.1.4
│ │ │ │ ├── call-bind@1.0.5 deduped
│ │ │ │ ├── define-properties@1.2.1 deduped
│ │ │ │ ├── has-symbols@1.0.3 deduped
│ │ │ │ └── object-keys@1.1.1 deduped
│ │ │ ├─┬ regexp.prototype.flags@1.5.1
│ │ │ │ ├── call-bind@1.0.5 deduped
│ │ │ │ ├── define-properties@1.2.1 deduped
│ │ │ │ └─┬ set-function-name@2.0.1
│ │ │ │ ├── define-data-property@1.1.1 deduped
│ │ │ │ ├── functions-have-names@1.2.3 deduped
│ │ │ │ └── has-property-descriptors@1.0.1 deduped
│ │ │ ├─┬ safe-array-concat@1.0.1
│ │ │ │ ├── call-bind@1.0.5 deduped
│ │ │ │ ├── get-intrinsic@1.2.2 deduped
│ │ │ │ ├── has-symbols@1.0.3 deduped
│ │ │ │ └── isarray@2.0.5
│ │ │ ├─┬ safe-regex-test@1.0.0
│ │ │ │ ├── call-bind@1.0.5 deduped
│ │ │ │ ├── get-intrinsic@1.2.2 deduped
│ │ │ │ └── is-regex@1.1.4 deduped
│ │ │ ├─┬ string.prototype.trim@1.2.8
│ │ │ │ ├── call-bind@1.0.5 deduped
│ │ │ │ ├── define-properties@1.2.1 deduped
│ │ │ │ └── es-abstract@1.22.3 deduped
│ │ │ ├─┬ string.prototype.trimend@1.0.7
│ │ │ │ ├── call-bind@1.0.5 deduped
│ │ │ │ ├── define-properties@1.2.1 deduped
│ │ │ │ └── es-abstract@1.22.3 deduped
│ │ │ ├─┬ string.prototype.trimstart@1.0.7
│ │ │ │ ├── call-bind@1.0.5 deduped
│ │ │ │ ├── define-properties@1.2.1 deduped
│ │ │ │ └── es-abstract@1.22.3 deduped
│ │ │ ├─┬ typed-array-buffer@1.0.0
│ │ │ │ ├── call-bind@1.0.5 deduped
│ │ │ │ ├── get-intrinsic@1.2.2 deduped
│ │ │ │ └── is-typed-array@1.1.12 deduped
│ │ │ ├─┬ typed-array-byte-length@1.0.0
│ │ │ │ ├── call-bind@1.0.5 deduped
│ │ │ │ ├─┬ for-each@0.3.3
│ │ │ │ │ └── is-callable@1.2.7 deduped
│ │ │ │ ├── has-proto@1.0.1 deduped
│ │ │ │ └── is-typed-array@1.1.12 deduped
│ │ │ ├─┬ typed-array-byte-offset@1.0.0
│ │ │ │ ├── available-typed-arrays@1.0.5 deduped
│ │ │ │ ├── call-bind@1.0.5 deduped
│ │ │ │ ├── for-each@0.3.3 deduped
│ │ │ │ ├── has-proto@1.0.1 deduped
│ │ │ │ └── is-typed-array@1.1.12 deduped
│ │ │ ├─┬ typed-array-length@1.0.4
│ │ │ │ ├── call-bind@1.0.5 deduped
│ │ │ │ ├── for-each@0.3.3 deduped
│ │ │ │ └── is-typed-array@1.1.12 deduped
│ │ │ ├─┬ unbox-primitive@1.0.2
│ │ │ │ ├── call-bind@1.0.5 deduped
│ │ │ │ ├── has-bigints@1.0.2
│ │ │ │ ├── has-symbols@1.0.3 deduped
│ │ │ │ └─┬ which-boxed-primitive@1.0.2
│ │ │ │ ├─┬ is-bigint@1.0.4
│ │ │ │ │ └── has-bigints@1.0.2 deduped
│ │ │ │ ├─┬ is-boolean-object@1.1.2
│ │ │ │ │ ├── call-bind@1.0.5 deduped
│ │ │ │ │ └── has-tostringtag@1.0.0 deduped
│ │ │ │ ├─┬ is-number-object@1.0.7
│ │ │ │ │ └── has-tostringtag@1.0.0 deduped
│ │ │ │ ├── is-string@1.0.7 deduped
│ │ │ │ └── is-symbol@1.0.4 deduped
│ │ │ └─┬ which-typed-array@1.1.13
│ │ │ ├── available-typed-arrays@1.0.5 deduped
│ │ │ ├── call-bind@1.0.5 deduped
│ │ │ ├── for-each@0.3.3 deduped
│ │ │ ├── gopd@1.0.1 deduped
│ │ │ └── has-tostringtag@1.0.0 deduped
│ │ ├─┬ get-intrinsic@1.2.2
│ │ │ ├── function-bind@1.1.2 deduped
│ │ │ ├── has-proto@1.0.1 deduped
│ │ │ ├── has-symbols@1.0.3 deduped
│ │ │ └── hasown@2.0.0 deduped
│ │ └─┬ is-string@1.0.7
│ │ └─┬ has-tostringtag@1.0.0
│ │ └── has-symbols@1.0.3 deduped
│ ├─┬ array.prototype.findlastindex@1.2.3
│ │ ├── call-bind@1.0.5 deduped
│ │ ├── define-properties@1.2.1 deduped
│ │ ├── es-abstract@1.22.3 deduped
│ │ ├─┬ es-shim-unscopables@1.0.2
│ │ │ └── hasown@2.0.0 deduped
│ │ └── get-intrinsic@1.2.2 deduped
│ ├─┬ array.prototype.flat@1.3.2
│ │ ├── call-bind@1.0.5 deduped
│ │ ├── define-properties@1.2.1 deduped
│ │ ├── es-abstract@1.22.3 deduped
│ │ └── es-shim-unscopables@1.0.2 deduped
│ ├─┬ array.prototype.flatmap@1.3.2
│ │ ├── call-bind@1.0.5 deduped
│ │ ├── define-properties@1.2.1 deduped
│ │ ├── es-abstract@1.22.3 deduped
│ │ └── es-shim-unscopables@1.0.2 deduped
│ ├─┬ debug@3.2.7
│ │ └── ms@2.1.2 deduped
│ ├─┬ doctrine@2.1.0
│ │ └── esutils@2.0.3 deduped
│ ├─┬ eslint-import-resolver-node@0.3.9
│ │ ├─┬ debug@3.2.7
│ │ │ └── ms@2.1.2 deduped
│ │ ├── is-core-module@2.13.1 deduped
│ │ └── resolve@1.22.8 deduped
│ ├─┬ eslint-module-utils@2.8.0
│ │ └─┬ debug@3.2.7
│ │ └── ms@2.1.2 deduped
│ ├── eslint@8.54.0 deduped
│ ├─┬ hasown@2.0.0
│ │ └── function-bind@1.1.2
│ ├─┬ is-core-module@2.13.1
│ │ └── hasown@2.0.0 deduped
│ ├─┬ is-glob@4.0.3
│ │ └── is-extglob@2.1.1
│ ├─┬ minimatch@3.1.2
│ │ └─┬ brace-expansion@1.1.11
│ │ ├── balanced-match@1.0.2
│ │ └── concat-map@0.0.1
│ ├─┬ object.fromentries@2.0.7
│ │ ├── call-bind@1.0.5 deduped
│ │ ├── define-properties@1.2.1 deduped
│ │ └── es-abstract@1.22.3 deduped
│ ├─┬ object.groupby@1.0.1
│ │ ├── call-bind@1.0.5 deduped
│ │ ├── define-properties@1.2.1 deduped
│ │ ├── es-abstract@1.22.3 deduped
│ │ └── get-intrinsic@1.2.2 deduped
│ ├─┬ object.values@1.1.7
│ │ ├── call-bind@1.0.5 deduped
│ │ ├── define-properties@1.2.1 deduped
│ │ └── es-abstract@1.22.3 deduped
│ ├── semver@6.3.1
│ └─┬ tsconfig-paths@3.14.2
│ ├── @types/json5@0.0.29
│ ├─┬ json5@1.0.2
│ │ └── minimist@1.2.8 deduped
│ ├── minimist@1.2.8
│ └── strip-bom@3.0.0
├─┬ eslint-plugin-jest@27.6.0
│ ├── @typescript-eslint/eslint-plugin@6.13.1 deduped
│ ├─┬ @typescript-eslint/utils@5.62.0
│ │ ├── @eslint-community/eslint-utils@4.4.0 deduped
│ │ ├── @types/json-schema@7.0.15 deduped
│ │ ├── @types/semver@7.5.6 deduped
│ │ ├─┬ @typescript-eslint/scope-manager@5.62.0
│ │ │ ├── @typescript-eslint/types@5.62.0 deduped
│ │ │ └─┬ @typescript-eslint/visitor-keys@5.62.0
│ │ │ ├── @typescript-eslint/types@5.62.0 deduped
│ │ │ └── eslint-visitor-keys@3.4.3 deduped
│ │ ├── @typescript-eslint/types@5.62.0
│ │ ├─┬ @typescript-eslint/typescript-estree@5.62.0
│ │ │ ├── @typescript-eslint/types@5.62.0 deduped
│ │ │ ├── @typescript-eslint/visitor-keys@5.62.0 deduped
│ │ │ ├── debug@4.3.4 deduped
│ │ │ ├── globby@11.1.0 deduped
│ │ │ ├── is-glob@4.0.3 deduped
│ │ │ ├── semver@7.5.4 deduped
│ │ │ └─┬ tsutils@3.21.0
│ │ │ ├── tslib@1.14.1
│ │ │ └── typescript@5.3.2 deduped
│ │ ├─┬ eslint-scope@5.1.1
│ │ │ ├── esrecurse@4.3.0 deduped
│ │ │ └── estraverse@4.3.0
│ │ ├── eslint@8.54.0 deduped
│ │ └── semver@7.5.4 deduped
│ ├── eslint@8.54.0 deduped
│ └── jest@29.7.0 deduped
├─┬ eslint-plugin-node@11.1.0
│ ├─┬ eslint-plugin-es@3.0.1
│ │ ├── eslint-utils@2.1.0 deduped
│ │ ├── eslint@8.54.0 deduped
│ │ └── regexpp@3.2.0
│ ├─┬ eslint-utils@2.1.0
│ │ └── eslint-visitor-keys@1.3.0
│ ├── eslint@8.54.0 deduped
│ ├── ignore@5.3.0 deduped
│ ├── minimatch@3.1.2 deduped
│ ├─┬ resolve@1.22.8
│ │ ├── is-core-module@2.13.1 deduped
│ │ ├── path-parse@1.0.7
│ │ └── supports-preserve-symlinks-flag@1.0.0
│ └── semver@6.3.1
├─┬ eslint@8.54.0
│ ├─┬ @eslint-community/eslint-utils@4.4.0
│ │ ├── eslint-visitor-keys@3.4.3 deduped
│ │ └── eslint@8.54.0 deduped
│ ├── @eslint-community/regexpp@4.10.0 deduped
│ ├─┬ @eslint/eslintrc@2.1.3
│ │ ├── ajv@6.12.6 deduped
│ │ ├── debug@4.3.4 deduped
│ │ ├── espree@9.6.1 deduped
│ │ ├─┬ globals@13.23.0
│ │ │ └── type-fest@0.20.2
│ │ ├── ignore@5.3.0 deduped
│ │ ├─┬ import-fresh@3.3.0
│ │ │ ├─┬ parent-module@1.0.1
│ │ │ │ └── callsites@3.1.0
│ │ │ └── resolve-from@4.0.0
│ │ ├── js-yaml@4.1.0 deduped
│ │ ├── minimatch@3.1.2 deduped
│ │ └── strip-json-comments@3.1.1
│ ├── @eslint/js@8.54.0
│ ├─┬ @humanwhocodes/config-array@0.11.13
│ │ ├── @humanwhocodes/object-schema@2.0.1
│ │ ├── debug@4.3.4 deduped
│ │ └── minimatch@3.1.2 deduped
│ ├── @humanwhocodes/module-importer@1.0.1
│ ├─┬ @nodelib/fs.walk@1.2.8
│ │ ├─┬ @nodelib/fs.scandir@2.1.5
│ │ │ ├── @nodelib/fs.stat@2.0.5
│ │ │ └─┬ run-parallel@1.2.0
│ │ │ └── queue-microtask@1.2.3
│ │ └─┬ fastq@1.15.0
│ │ └── reusify@1.0.4
│ ├── @ungap/structured-clone@1.2.0
│ ├─┬ ajv@6.12.6
│ │ ├── fast-deep-equal@3.1.3 deduped
│ │ ├── fast-json-stable-stringify@2.1.0 deduped
│ │ ├── json-schema-traverse@0.4.1
│ │ └─┬ uri-js@4.4.1
│ │ └── punycode@2.3.1
│ ├─┬ chalk@4.1.2
│ │ ├─┬ ansi-styles@4.3.0
│ │ │ └─┬ color-convert@2.0.1
│ │ │ └── color-name@1.1.4
│ │ └─┬ supports-color@7.2.0
│ │ └── has-flag@4.0.0
│ ├─┬ cross-spawn@7.0.3
│ │ ├── path-key@3.1.1
│ │ ├─┬ shebang-command@2.0.0
│ │ │ └── shebang-regex@3.0.0
│ │ └─┬ which@2.0.2
│ │ └── isexe@2.0.0
│ ├── debug@4.3.4 deduped
│ ├─┬ doctrine@3.0.0
│ │ └── esutils@2.0.3 deduped
│ ├── escape-string-regexp@4.0.0
│ ├─┬ eslint-scope@7.2.2
│ │ ├─┬ esrecurse@4.3.0
│ │ │ └── estraverse@5.3.0 deduped
│ │ └── estraverse@5.3.0
│ ├── eslint-visitor-keys@3.4.3
│ ├─┬ espree@9.6.1
│ │ ├─┬ acorn-jsx@5.3.2
│ │ │ └── acorn@8.11.2 deduped
│ │ ├── acorn@8.11.2 deduped
│ │ └── eslint-visitor-keys@3.4.3 deduped
│ ├─┬ esquery@1.5.0
│ │ └── estraverse@5.3.0 deduped
│ ├── esutils@2.0.3
│ ├── fast-deep-equal@3.1.3
│ ├─┬ file-entry-cache@6.0.1
│ │ └─┬ flat-cache@3.2.0
│ │ ├── flatted@3.2.9
│ │ ├─┬ keyv@4.5.4
│ │ │ └── json-buffer@3.0.1
│ │ └─┬ rimraf@3.0.2
│ │ └── glob@7.2.3 deduped
│ ├─┬ find-up@5.0.0
│ │ ├─┬ locate-path@6.0.0
│ │ │ └─┬ p-locate@5.0.0
│ │ │ └── p-limit@3.1.0 deduped
│ │ └── path-exists@4.0.0
│ ├─┬ glob-parent@6.0.2
│ │ └── is-glob@4.0.3 deduped
│ ├─┬ globals@13.23.0
│ │ └── type-fest@0.20.2
│ ├── graphemer@1.4.0 deduped
│ ├── ignore@5.3.0 deduped
│ ├── imurmurhash@0.1.4
│ ├── is-glob@4.0.3 deduped
│ ├── is-path-inside@3.0.3
│ ├─┬ js-yaml@4.1.0
│ │ └── argparse@2.0.1
│ ├── json-stable-stringify-without-jsonify@1.0.1
│ ├─┬ levn@0.4.1
│ │ ├── prelude-ls@1.2.1
│ │ └─┬ type-check@0.4.0
│ │ └── prelude-ls@1.2.1 deduped
│ ├── lodash.merge@4.6.2
│ ├── minimatch@3.1.2 deduped
│ ├── natural-compare@1.4.0 deduped
│ ├─┬ optionator@0.9.3
│ │ ├── @aashutoshrathi/word-wrap@1.2.6
│ │ ├── deep-is@0.1.4
│ │ ├── fast-levenshtein@2.0.6
│ │ ├── levn@0.4.1 deduped
│ │ ├── prelude-ls@1.2.1 deduped
│ │ └── type-check@0.4.0 deduped
│ ├─┬ strip-ansi@6.0.1
│ │ └── ansi-regex@5.0.1
│ └── text-table@0.2.0
├─┬ express-flash@0.0.2
│ └── connect-flash@0.1.1
├─┬ express-session@1.17.3
│ ├── cookie-signature@1.0.6
│ ├── cookie@0.4.2
│ ├─┬ debug@2.6.9
│ │ └── ms@2.0.0
│ ├── depd@2.0.0 deduped
│ ├── on-headers@1.0.2 deduped
│ ├── parseurl@1.3.3
│ ├── safe-buffer@5.2.1
│ └─┬ uid-safe@2.1.5
│ └── random-bytes@1.0.0
├─┬ express-validator@7.0.1
│ ├── lodash@4.17.21 deduped
│ └── validator@13.11.0
├─┬ express@4.18.2
│ ├── accepts@1.3.8 deduped
│ ├── array-flatten@1.1.1
│ ├─┬ body-parser@1.20.1
│ │ ├── bytes@3.1.2 deduped
│ │ ├── content-type@1.0.5 deduped
│ │ ├── debug@2.6.9 deduped
│ │ ├── depd@2.0.0 deduped
│ │ ├── destroy@1.2.0 deduped
│ │ ├── http-errors@2.0.0 deduped
│ │ ├── iconv-lite@0.4.24 deduped
│ │ ├── on-finished@2.4.1 deduped
│ │ ├── qs@6.11.0 deduped
│ │ ├─┬ raw-body@2.5.1
│ │ │ ├── bytes@3.1.2 deduped
│ │ │ ├── http-errors@2.0.0 deduped
│ │ │ ├── iconv-lite@0.4.24 deduped
│ │ │ └── unpipe@1.0.0 deduped
│ │ ├── type-is@1.6.18 deduped
│ │ └── unpipe@1.0.0 deduped
│ ├─┬ content-disposition@0.5.4
│ │ └── safe-buffer@5.2.1
│ ├── content-type@1.0.5 deduped
│ ├── cookie-signature@1.0.6 deduped
│ ├── cookie@0.5.0
│ ├─┬ debug@2.6.9
│ │ └── ms@2.0.0
│ ├── depd@2.0.0 deduped
│ ├── encodeurl@1.0.2
│ ├── escape-html@1.0.3 deduped
│ ├── etag@1.8.1
│ ├─┬ finalhandler@1.2.0
│ │ ├─┬ debug@2.6.9
│ │ │ └── ms@2.0.0
│ │ ├── encodeurl@1.0.2 deduped
│ │ ├── escape-html@1.0.3 deduped
│ │ ├── on-finished@2.4.1 deduped
│ │ ├── parseurl@1.3.3 deduped
│ │ ├── statuses@2.0.1 deduped
│ │ └── unpipe@1.0.0 deduped
│ ├── fresh@0.5.2
│ ├── http-errors@2.0.0 deduped
│ ├── merge-descriptors@1.0.1
│ ├── methods@1.1.2
│ ├── on-finished@2.4.1 deduped
│ ├── parseurl@1.3.3 deduped
│ ├── path-to-regexp@0.1.7
│ ├─┬ proxy-addr@2.0.7
│ │ ├── forwarded@0.2.0
│ │ └── ipaddr.js@1.9.1
│ ├── qs@6.11.0 deduped
│ ├── range-parser@1.2.1
│ ├── safe-buffer@5.2.1
│ ├─┬ send@0.18.0
│ │ ├─┬ debug@2.6.9
│ │ │ └── ms@2.0.0
│ │ ├── depd@2.0.0 deduped
│ │ ├── destroy@1.2.0 deduped
│ │ ├── encodeurl@1.0.2 deduped
│ │ ├── escape-html@1.0.3 deduped
│ │ ├── etag@1.8.1 deduped
│ │ ├── fresh@0.5.2 deduped
│ │ ├── http-errors@2.0.0 deduped
│ │ ├── mime@1.6.0
│ │ ├── ms@2.1.3
│ │ ├── on-finished@2.4.1 deduped
│ │ ├── range-parser@1.2.1 deduped
│ │ └── statuses@2.0.1 deduped
│ ├─┬ serve-static@1.15.0
│ │ ├── encodeurl@1.0.2 deduped
│ │ ├── escape-html@1.0.3 deduped
│ │ ├── parseurl@1.3.3 deduped
│ │ └── send@0.18.0 deduped
│ ├── setprototypeof@1.2.0
│ ├── statuses@2.0.1
│ ├── type-is@1.6.18 deduped
│ ├── utils-merge@1.0.1
│ └── vary@1.1.2 deduped
├─┬ fbgraph@1.4.4
│ ├── qs@6.11.0 deduped
│ └─┬ request@2.88.2
│ ├── aws-sign2@0.7.0
│ ├── aws4@1.12.0
│ ├── caseless@0.12.0
│ ├── combined-stream@1.0.8 deduped
│ ├── extend@3.0.2
│ ├── forever-agent@0.6.1
│ ├─┬ form-data@2.3.3
│ │ ├── asynckit@0.4.0 deduped
│ │ ├── combined-stream@1.0.8 deduped
│ │ └── mime-types@2.1.35 deduped
│ ├─┬ har-validator@5.1.5
│ │ ├── ajv@6.12.6 deduped
│ │ └── har-schema@2.0.0
│ ├─┬ http-signature@1.2.0
│ │ ├── assert-plus@1.0.0
│ │ ├─┬ jsprim@1.4.2
│ │ │ ├── assert-plus@1.0.0 deduped
│ │ │ ├── extsprintf@1.3.0
│ │ │ ├── json-schema@0.4.0
│ │ │ └─┬ verror@1.10.0
│ │ │ ├── assert-plus@1.0.0 deduped
│ │ │ ├── core-util-is@1.0.2
│ │ │ └── extsprintf@1.3.0 deduped
│ │ └─┬ sshpk@1.18.0
│ │ ├─┬ asn1@0.2.6
│ │ │ └── safer-buffer@2.1.2 deduped
│ │ ├── assert-plus@1.0.0 deduped
│ │ ├─┬ bcrypt-pbkdf@1.0.2
│ │ │ └── tweetnacl@0.14.5 deduped
│ │ ├─┬ dashdash@1.14.1
│ │ │ └── assert-plus@1.0.0 deduped
│ │ ├─┬ ecc-jsbn@0.1.2
│ │ │ ├── jsbn@0.1.1 deduped
│ │ │ └── safer-buffer@2.1.2 deduped
│ │ ├─┬ getpass@0.1.7
│ │ │ └── assert-plus@1.0.0 deduped
│ │ ├── jsbn@0.1.1
│ │ ├── safer-buffer@2.1.2 deduped
│ │ └── tweetnacl@0.14.5
│ ├── is-typedarray@1.0.0
│ ├── isstream@0.1.2
│ ├── json-stringify-safe@5.0.1
│ ├── mime-types@2.1.35 deduped
│ ├── oauth-sign@0.9.0
│ ├── performance-now@2.1.0
│ ├── qs@6.5.3
│ ├── safe-buffer@5.1.2 deduped
│ ├─┬ tough-cookie@2.5.0
│ │ ├── psl@1.9.0
│ │ └── punycode@2.3.1 deduped
│ ├─┬ tunnel-agent@0.6.0
│ │ └── safe-buffer@5.1.2 deduped
│ └── uuid@3.4.0
├── figlet@1.7.0
├─┬ fs-extra@11.2.0
│ ├── graceful-fs@4.2.11
│ ├─┬ jsonfile@6.1.0
│ │ ├── graceful-fs@4.2.11 deduped
│ │ └── universalify@2.0.1 deduped
│ └── universalify@2.0.1
├── graphql@16.8.1
├── husky@8.0.3
├── jade-bootstrap@1.0.14
├─┬ jest@29.7.0
│ ├─┬ @jest/core@29.7.0
│ │ ├─┬ @jest/console@29.7.0
│ │ │ ├── @jest/types@29.6.3 deduped
│ │ │ ├── @types/node@20.10.0 deduped
│ │ │ ├─┬ chalk@4.1.2
│ │ │ │ ├─┬ ansi-styles@4.3.0
│ │ │ │ │ └─┬ color-convert@2.0.1
│ │ │ │ │ └── color-name@1.1.4
│ │ │ │ └─┬ supports-color@7.2.0
│ │ │ │ └── has-flag@4.0.0
│ │ │ ├── jest-message-util@29.7.0 deduped
│ │ │ ├── jest-util@29.7.0 deduped
│ │ │ └── slash@3.0.0
│ │ ├─┬ @jest/reporters@29.7.0
│ │ │ ├── @bcoe/v8-coverage@0.2.3
│ │ │ ├── @jest/console@29.7.0 deduped
│ │ │ ├── @jest/test-result@29.7.0 deduped
│ │ │ ├── @jest/transform@29.7.0 deduped
│ │ │ ├── @jest/types@29.6.3 deduped
│ │ │ ├─┬ @jridgewell/trace-mapping@0.3.20
│ │ │ │ ├── @jridgewell/resolve-uri@3.1.1 deduped
│ │ │ │ └── @jridgewell/sourcemap-codec@1.4.15 deduped
│ │ │ ├── @types/node@20.10.0 deduped
│ │ │ ├─┬ chalk@4.1.2
│ │ │ │ ├─┬ ansi-styles@4.3.0
│ │ │ │ │ └─┬ color-convert@2.0.1
│ │ │ │ │ └── color-name@1.1.4
│ │ │ │ └─┬ supports-color@7.2.0
│ │ │ │ └── has-flag@4.0.0
│ │ │ ├── collect-v8-coverage@1.0.2
│ │ │ ├── exit@0.1.2 deduped
│ │ │ ├── glob@7.2.3 deduped
│ │ │ ├── graceful-fs@4.2.11 deduped
│ │ │ ├── istanbul-lib-coverage@3.2.2
│ │ │ ├─┬ istanbul-lib-instrument@6.0.1
│ │ │ │ ├── @babel/core@7.23.3 deduped
│ │ │ │ ├── @babel/parser@7.23.4 deduped
│ │ │ │ ├── @istanbuljs/schema@0.1.3 deduped
│ │ │ │ ├── istanbul-lib-coverage@3.2.2 deduped
│ │ │ │ └── semver@7.5.4 deduped
│ │ │ ├─┬ istanbul-lib-report@3.0.1
│ │ │ │ ├── istanbul-lib-coverage@3.2.2 deduped
│ │ │ │ ├─┬ make-dir@4.0.0
│ │ │ │ │ └── semver@7.5.4 deduped
│ │ │ │ └─┬ supports-color@7.2.0
│ │ │ │ └── has-flag@4.0.0
│ │ │ ├─┬ istanbul-lib-source-maps@4.0.1
│ │ │ │ ├── debug@4.3.4 deduped
│ │ │ │ ├── istanbul-lib-coverage@3.2.2 deduped
│ │ │ │ └── source-map@0.6.1 deduped
│ │ │ ├─┬ istanbul-reports@3.1.6
│ │ │ │ ├── html-escaper@2.0.2
│ │ │ │ └── istanbul-lib-report@3.0.1 deduped
│ │ │ ├── jest-message-util@29.7.0 deduped
│ │ │ ├── jest-util@29.7.0 deduped
│ │ │ ├─┬ jest-worker@29.7.0
│ │ │ │ ├── @types/node@20.10.0 deduped
│ │ │ │ ├── jest-util@29.7.0 deduped
│ │ │ │ ├── merge-stream@2.0.0
│ │ │ │ └─┬ supports-color@8.1.1
│ │ │ │ └── has-flag@4.0.0
│ │ │ ├── UNMET OPTIONAL DEPENDENCY node-notifier@^8.0.1 || ^9.0.0 || ^10.0.0
│ │ │ ├── slash@3.0.0
│ │ │ ├─┬ string-length@4.0.2
│ │ │ │ ├── char-regex@1.0.2
│ │ │ │ └── strip-ansi@6.0.1 deduped
│ │ │ ├── strip-ansi@6.0.1 deduped
│ │ │ └─┬ v8-to-istanbul@9.2.0
│ │ │ ├── @jridgewell/trace-mapping@0.3.20 deduped
│ │ │ ├── @types/istanbul-lib-coverage@2.0.6 deduped
│ │ │ └── convert-source-map@2.0.0 deduped
│ │ ├─┬ @jest/test-result@29.7.0
│ │ │ ├── @jest/console@29.7.0 deduped
│ │ │ ├── @jest/types@29.6.3 deduped
│ │ │ ├── @types/istanbul-lib-coverage@2.0.6 deduped
│ │ │ └── collect-v8-coverage@1.0.2 deduped
│ │ ├─┬ @jest/transform@29.7.0
│ │ │ ├── @babel/core@7.23.3 deduped
│ │ │ ├── @jest/types@29.6.3 deduped
│ │ │ ├── @jridgewell/trace-mapping@0.3.20 deduped
│ │ │ ├── babel-plugin-istanbul@6.1.1 deduped
│ │ │ ├─┬ chalk@4.1.2
│ │ │ │ ├─┬ ansi-styles@4.3.0
│ │ │ │ │ └─┬ color-convert@2.0.1
│ │ │ │ │ └── color-name@1.1.4
│ │ │ │ └─┬ supports-color@7.2.0
│ │ │ │ └── has-flag@4.0.0
│ │ │ ├── convert-source-map@2.0.0 deduped
│ │ │ ├── fast-json-stable-stringify@2.1.0 deduped
│ │ │ ├── graceful-fs@4.2.11 deduped
│ │ │ ├── jest-haste-map@29.7.0 deduped
│ │ │ ├── jest-regex-util@29.6.3 deduped
│ │ │ ├── jest-util@29.7.0 deduped
│ │ │ ├── micromatch@4.0.5 deduped
│ │ │ ├── pirates@4.0.6
│ │ │ ├── slash@3.0.0
│ │ │ └─┬ write-file-atomic@4.0.2
│ │ │ ├── imurmurhash@0.1.4 deduped
│ │ │ └── signal-exit@3.0.7
│ │ ├── @jest/types@29.6.3 deduped
│ │ ├── @types/node@20.10.0 deduped
│ │ ├─┬ ansi-escapes@4.3.2
│ │ │ └── type-fest@0.21.3
│ │ ├─┬ chalk@4.1.2
│ │ │ ├─┬ ansi-styles@4.3.0
│ │ │ │ └─┬ color-convert@2.0.1
│ │ │ │ └── color-name@1.1.4
│ │ │ └─┬ supports-color@7.2.0
│ │ │ └── has-flag@4.0.0
│ │ ├── ci-info@3.9.0
│ │ ├── exit@0.1.2
│ │ ├── graceful-fs@4.2.11 deduped
│ │ ├─┬ jest-changed-files@29.7.0
│ │ │ ├─┬ execa@5.1.1
│ │ │ │ ├── cross-spawn@7.0.3 deduped
│ │ │ │ ├── get-stream@6.0.1
│ │ │ │ ├── human-signals@2.1.0
│ │ │ │ ├── is-stream@2.0.1 deduped
│ │ │ │ ├── merge-stream@2.0.0 deduped
│ │ │ │ ├─┬ npm-run-path@4.0.1
│ │ │ │ │ └── path-key@3.1.1 deduped
│ │ │ │ ├─┬ onetime@5.1.2
│ │ │ │ │ └── mimic-fn@2.1.0
│ │ │ │ ├── signal-exit@3.0.7 deduped
│ │ │ │ └── strip-final-newline@2.0.0
│ │ │ ├── jest-util@29.7.0 deduped
│ │ │ └─┬ p-limit@3.1.0
│ │ │ └── yocto-queue@0.1.0
│ │ ├─┬ jest-config@29.7.0
│ │ │ ├── @babel/core@7.23.3 deduped
│ │ │ ├─┬ @jest/test-sequencer@29.7.0
│ │ │ │ ├── @jest/test-result@29.7.0 deduped
│ │ │ │ ├── graceful-fs@4.2.11 deduped
│ │ │ │ ├── jest-haste-map@29.7.0 deduped
│ │ │ │ └── slash@3.0.0
│ │ │ ├── @jest/types@29.6.3 deduped
│ │ │ ├── @types/node@20.10.0 deduped
│ │ │ ├── babel-jest@29.7.0 deduped
│ │ │ ├─┬ chalk@4.1.2
│ │ │ │ ├─┬ ansi-styles@4.3.0
│ │ │ │ │ └─┬ color-convert@2.0.1
│ │ │ │ │ └── color-name@1.1.4
│ │ │ │ └─┬ supports-color@7.2.0
│ │ │ │ └── has-flag@4.0.0
│ │ │ ├── ci-info@3.9.0 deduped
│ │ │ ├── deepmerge@4.3.1
│ │ │ ├── glob@7.2.3 deduped
│ │ │ ├── graceful-fs@4.2.11 deduped
│ │ │ ├─┬ jest-circus@29.7.0
│ │ │ │ ├── @jest/environment@29.7.0 deduped
│ │ │ │ ├─┬ @jest/expect@29.7.0
│ │ │ │ │ ├── expect@29.7.0 deduped
│ │ │ │ │ └── jest-snapshot@29.7.0 deduped
│ │ │ │ ├── @jest/test-result@29.7.0 deduped
│ │ │ │ ├── @jest/types@29.6.3 deduped
│ │ │ │ ├── @types/node@20.10.0 deduped
│ │ │ │ ├─┬ chalk@4.1.2
│ │ │ │ │ ├─┬ ansi-styles@4.3.0
│ │ │ │ │ │ └─┬ color-convert@2.0.1
│ │ │ │ │ │ └── color-name@1.1.4
│ │ │ │ │ └─┬ supports-color@7.2.0
│ │ │ │ │ └── has-flag@4.0.0
│ │ │ │ ├── co@4.6.0
│ │ │ │ ├─┬ dedent@1.5.1
│ │ │ │ │ └── UNMET OPTIONAL DEPENDENCY babel-plugin-macros@^3.1.0
│ │ │ │ ├── is-generator-fn@2.1.0
│ │ │ │ ├─┬ jest-each@29.7.0
│ │ │ │ │ ├── @jest/types@29.6.3 deduped
│ │ │ │ │ ├─┬ chalk@4.1.2
│ │ │ │ │ │ ├─┬ ansi-styles@4.3.0
│ │ │ │ │ │ │ └─┬ color-convert@2.0.1
│ │ │ │ │ │ │ └── color-name@1.1.4
│ │ │ │ │ │ └─┬ supports-color@7.2.0
│ │ │ │ │ │ └── has-flag@4.0.0
│ │ │ │ │ ├── jest-get-type@29.6.3 deduped
│ │ │ │ │ ├── jest-util@29.7.0 deduped
│ │ │ │ │ └── pretty-format@29.7.0 deduped
│ │ │ │ ├── jest-matcher-utils@29.7.0 deduped
│ │ │ │ ├── jest-message-util@29.7.0 deduped
│ │ │ │ ├── jest-runtime@29.7.0 deduped
│ │ │ │ ├── jest-snapshot@29.7.0 deduped
│ │ │ │ ├── jest-util@29.7.0 deduped
│ │ │ │ ├── p-limit@3.1.0 deduped
│ │ │ │ ├── pretty-format@29.7.0 deduped
│ │ │ │ ├── pure-rand@6.0.4
│ │ │ │ ├── slash@3.0.0
│ │ │ │ └── stack-utils@2.0.6 deduped
│ │ │ ├── jest-environment-node@29.7.0 deduped
│ │ │ ├── jest-get-type@29.6.3 deduped
│ │ │ ├── jest-regex-util@29.6.3 deduped
│ │ │ ├── jest-resolve@29.7.0 deduped
│ │ │ ├── jest-runner@29.7.0 deduped
│ │ │ ├── jest-util@29.7.0 deduped
│ │ │ ├── jest-validate@29.7.0 deduped
│ │ │ ├── micromatch@4.0.5 deduped
│ │ │ ├─┬ parse-json@5.2.0
│ │ │ │ ├── @babel/code-frame@7.23.4 deduped
│ │ │ │ ├─┬ error-ex@1.3.2
│ │ │ │ │ └── is-arrayish@0.2.1
│ │ │ │ ├── json-parse-even-better-errors@2.3.1
│ │ │ │ └── lines-and-columns@1.2.4
│ │ │ ├── pretty-format@29.7.0 deduped
│ │ │ ├── slash@3.0.0
│ │ │ ├── strip-json-comments@3.1.1 deduped
│ │ │ └── ts-node@10.9.1 deduped
│ │ ├─┬ jest-haste-map@29.7.0
│ │ │ ├── @jest/types@29.6.3 deduped
│ │ │ ├─┬ @types/graceful-fs@4.1.9
│ │ │ │ └── @types/node@20.10.0 deduped
│ │ │ ├── @types/node@20.10.0 deduped
│ │ │ ├── anymatch@3.1.3 deduped
│ │ │ ├─┬ fb-watchman@2.0.2
│ │ │ │ └─┬ bser@2.1.1
│ │ │ │ └── node-int64@0.4.0
│ │ │ ├── UNMET OPTIONAL DEPENDENCY fsevents@^2.3.2
│ │ │ ├── graceful-fs@4.2.11 deduped
│ │ │ ├── jest-regex-util@29.6.3 deduped
│ │ │ ├── jest-util@29.7.0 deduped
│ │ │ ├── jest-worker@29.7.0 deduped
│ │ │ ├── micromatch@4.0.5 deduped
│ │ │ └─┬ walker@1.0.8
│ │ │ └─┬ makeerror@1.0.12
│ │ │ └── tmpl@1.0.5
│ │ ├── jest-message-util@29.7.0 deduped
│ │ ├── jest-regex-util@29.6.3
│ │ ├─┬ jest-resolve-dependencies@29.7.0
│ │ │ ├── jest-regex-util@29.6.3 deduped
│ │ │ └── jest-snapshot@29.7.0 deduped
│ │ ├─┬ jest-resolve@29.7.0
│ │ │ ├─┬ chalk@4.1.2
│ │ │ │ ├─┬ ansi-styles@4.3.0
│ │ │ │ │ └─┬ color-convert@2.0.1
│ │ │ │ │ └── color-name@1.1.4
│ │ │ │ └─┬ supports-color@7.2.0
│ │ │ │ └── has-flag@4.0.0
│ │ │ ├── graceful-fs@4.2.11 deduped
│ │ │ ├── jest-haste-map@29.7.0 deduped
│ │ │ ├─┬ jest-pnp-resolver@1.2.3
│ │ │ │ └── jest-resolve@29.7.0 deduped
│ │ │ ├── jest-util@29.7.0 deduped
│ │ │ ├── jest-validate@29.7.0 deduped
│ │ │ ├── resolve.exports@2.0.2
│ │ │ ├── resolve@1.22.8 deduped
│ │ │ └── slash@3.0.0
│ │ ├─┬ jest-runner@29.7.0
│ │ │ ├── @jest/console@29.7.0 deduped
│ │ │ ├── @jest/environment@29.7.0 deduped
│ │ │ ├── @jest/test-result@29.7.0 deduped
│ │ │ ├── @jest/transform@29.7.0 deduped
│ │ │ ├── @jest/types@29.6.3 deduped
│ │ │ ├── @types/node@20.10.0 deduped
│ │ │ ├─┬ chalk@4.1.2
│ │ │ │ ├─┬ ansi-styles@4.3.0
│ │ │ │ │ └─┬ color-convert@2.0.1
│ │ │ │ │ └── color-name@1.1.4
│ │ │ │ └─┬ supports-color@7.2.0
│ │ │ │ └── has-flag@4.0.0
│ │ │ ├── emittery@0.13.1
│ │ │ ├── graceful-fs@4.2.11 deduped
│ │ │ ├─┬ jest-docblock@29.7.0
│ │ │ │ └── detect-newline@3.1.0
│ │ │ ├── jest-environment-node@29.7.0 deduped
│ │ │ ├── jest-haste-map@29.7.0 deduped
│ │ │ ├─┬ jest-leak-detector@29.7.0
│ │ │ │ ├── jest-get-type@29.6.3 deduped
│ │ │ │ └── pretty-format@29.7.0 deduped
│ │ │ ├── jest-message-util@29.7.0 deduped
│ │ │ ├── jest-resolve@29.7.0 deduped
│ │ │ ├── jest-runtime@29.7.0 deduped
│ │ │ ├── jest-util@29.7.0 deduped
│ │ │ ├── jest-watcher@29.7.0 deduped
│ │ │ ├── jest-worker@29.7.0 deduped
│ │ │ ├── p-limit@3.1.0 deduped
│ │ │ └─┬ source-map-support@0.5.13
│ │ │ ├── buffer-from@1.1.2 deduped
│ │ │ └── source-map@0.6.1 deduped
│ │ ├─┬ jest-runtime@29.7.0
│ │ │ ├── @jest/environment@29.7.0 deduped
│ │ │ ├── @jest/fake-timers@29.7.0 deduped
│ │ │ ├─┬ @jest/globals@29.7.0
│ │ │ │ ├── @jest/environment@29.7.0 deduped
│ │ │ │ ├── @jest/expect@29.7.0 deduped
│ │ │ │ ├── @jest/types@29.6.3 deduped
│ │ │ │ └── jest-mock@29.7.0 deduped
│ │ │ ├─┬ @jest/source-map@29.6.3
│ │ │ │ ├── @jridgewell/trace-mapping@0.3.20 deduped
│ │ │ │ ├── callsites@3.1.0 deduped
│ │ │ │ └── graceful-fs@4.2.11 deduped
│ │ │ ├── @jest/test-result@29.7.0 deduped
│ │ │ ├── @jest/transform@29.7.0 deduped
│ │ │ ├── @jest/types@29.6.3 deduped
│ │ │ ├── @types/node@20.10.0 deduped
│ │ │ ├─┬ chalk@4.1.2
│ │ │ │ ├─┬ ansi-styles@4.3.0
│ │ │ │ │ └─┬ color-convert@2.0.1
│ │ │ │ │ └── color-name@1.1.4
│ │ │ │ └─┬ supports-color@7.2.0
│ │ │ │ └── has-flag@4.0.0
│ │ │ ├── cjs-module-lexer@1.2.3
│ │ │ ├── collect-v8-coverage@1.0.2 deduped
│ │ │ ├── glob@7.2.3 deduped
│ │ │ ├── graceful-fs@4.2.11 deduped
│ │ │ ├── jest-haste-map@29.7.0 deduped
│ │ │ ├── jest-message-util@29.7.0 deduped
│ │ │ ├── jest-mock@29.7.0 deduped
│ │ │ ├── jest-regex-util@29.6.3 deduped
│ │ │ ├── jest-resolve@29.7.0 deduped
│ │ │ ├── jest-snapshot@29.7.0 deduped
│ │ │ ├── jest-util@29.7.0 deduped
│ │ │ ├── slash@3.0.0
│ │ │ └── strip-bom@4.0.0
│ │ ├─┬ jest-snapshot@29.7.0
│ │ │ ├── @babel/core@7.23.3 deduped
│ │ │ ├── @babel/generator@7.23.4 deduped
│ │ │ ├─┬ @babel/plugin-syntax-jsx@7.23.3
│ │ │ │ ├── @babel/core@7.23.3 deduped
│ │ │ │ └── @babel/helper-plugin-utils@7.22.5 deduped
│ │ │ ├─┬ @babel/plugin-syntax-typescript@7.23.3
│ │ │ │ ├── @babel/core@7.23.3 deduped
│ │ │ │ └── @babel/helper-plugin-utils@7.22.5 deduped
│ │ │ ├── @babel/types@7.23.4 deduped
│ │ │ ├── @jest/expect-utils@29.7.0 deduped
│ │ │ ├── @jest/transform@29.7.0 deduped
│ │ │ ├── @jest/types@29.6.3 deduped
│ │ │ ├─┬ babel-preset-current-node-syntax@1.0.1
│ │ │ │ ├── @babel/core@7.23.3 deduped
│ │ │ │ ├─┬ @babel/plugin-syntax-async-generators@7.8.4
│ │ │ │ │ ├── @babel/core@7.23.3 deduped
│ │ │ │ │ └── @babel/helper-plugin-utils@7.22.5 deduped
│ │ │ │ ├─┬ @babel/plugin-syntax-bigint@7.8.3
│ │ │ │ │ ├── @babel/core@7.23.3 deduped
│ │ │ │ │ └── @babel/helper-plugin-utils@7.22.5 deduped
│ │ │ │ ├─┬ @babel/plugin-syntax-class-properties@7.12.13
│ │ │ │ │ ├── @babel/core@7.23.3 deduped
│ │ │ │ │ └── @babel/helper-plugin-utils@7.22.5 deduped
│ │ │ │ ├─┬ @babel/plugin-syntax-import-meta@7.10.4
│ │ │ │ │ ├── @babel/core@7.23.3 deduped
│ │ │ │ │ └── @babel/helper-plugin-utils@7.22.5 deduped
│ │ │ │ ├─┬ @babel/plugin-syntax-json-strings@7.8.3
│ │ │ │ │ ├── @babel/core@7.23.3 deduped
│ │ │ │ │ └── @babel/helper-plugin-utils@7.22.5 deduped
│ │ │ │ ├─┬ @babel/plugin-syntax-logical-assignment-operators@7.10.4
│ │ │ │ │ ├── @babel/core@7.23.3 deduped
│ │ │ │ │ └── @babel/helper-plugin-utils@7.22.5 deduped
│ │ │ │ ├─┬ @babel/plugin-syntax-nullish-coalescing-operator@7.8.3
│ │ │ │ │ ├── @babel/core@7.23.3 deduped
│ │ │ │ │ └── @babel/helper-plugin-utils@7.22.5 deduped
│ │ │ │ ├─┬ @babel/plugin-syntax-numeric-separator@7.10.4
│ │ │ │ │ ├── @babel/core@7.23.3 deduped
│ │ │ │ │ └── @babel/helper-plugin-utils@7.22.5 deduped
│ │ │ │ ├─┬ @babel/plugin-syntax-object-rest-spread@7.8.3
│ │ │ │ │ ├── @babel/core@7.23.3 deduped
│ │ │ │ │ └── @babel/helper-plugin-utils@7.22.5 deduped
│ │ │ │ ├─┬ @babel/plugin-syntax-optional-catch-binding@7.8.3
│ │ │ │ │ ├── @babel/core@7.23.3 deduped
│ │ │ │ │ └── @babel/helper-plugin-utils@7.22.5 deduped
│ │ │ │ ├─┬ @babel/plugin-syntax-optional-chaining@7.8.3
│ │ │ │ │ ├── @babel/core@7.23.3 deduped
│ │ │ │ │ └── @babel/helper-plugin-utils@7.22.5 deduped
│ │ │ │ └─┬ @babel/plugin-syntax-top-level-await@7.14.5
│ │ │ │ ├── @babel/core@7.23.3 deduped
│ │ │ │ └── @babel/helper-plugin-utils@7.22.5 deduped
│ │ │ ├─┬ chalk@4.1.2
│ │ │ │ ├─┬ ansi-styles@4.3.0
│ │ │ │ │ └─┬ color-convert@2.0.1
│ │ │ │ │ └── color-name@1.1.4
│ │ │ │ └─┬ supports-color@7.2.0
│ │ │ │ └── has-flag@4.0.0
│ │ │ ├── expect@29.7.0 deduped
│ │ │ ├── graceful-fs@4.2.11 deduped
│ │ │ ├── jest-diff@29.7.0 deduped
│ │ │ ├── jest-get-type@29.6.3 deduped
│ │ │ ├── jest-matcher-utils@29.7.0 deduped
│ │ │ ├── jest-message-util@29.7.0 deduped
│ │ │ ├── jest-util@29.7.0 deduped
│ │ │ ├── natural-compare@1.4.0 deduped
│ │ │ ├── pretty-format@29.7.0 deduped
│ │ │ └── semver@7.5.4 deduped
│ │ ├── jest-util@29.7.0 deduped
│ │ ├─┬ jest-validate@29.7.0
│ │ │ ├── @jest/types@29.6.3 deduped
│ │ │ ├── camelcase@6.3.0
│ │ │ ├─┬ chalk@4.1.2
│ │ │ │ ├─┬ ansi-styles@4.3.0
│ │ │ │ │ └─┬ color-convert@2.0.1
│ │ │ │ │ └── color-name@1.1.4
│ │ │ │ └─┬ supports-color@7.2.0
│ │ │ │ └── has-flag@4.0.0
│ │ │ ├── jest-get-type@29.6.3 deduped
│ │ │ ├── leven@3.1.0
│ │ │ └── pretty-format@29.7.0 deduped
│ │ ├─┬ jest-watcher@29.7.0
│ │ │ ├── @jest/test-result@29.7.0 deduped
│ │ │ ├── @jest/types@29.6.3 deduped
│ │ │ ├── @types/node@20.10.0 deduped
│ │ │ ├── ansi-escapes@4.3.2 deduped
│ │ │ ├─┬ chalk@4.1.2
│ │ │ │ ├─┬ ansi-styles@4.3.0
│ │ │ │ │ └─┬ color-convert@2.0.1
│ │ │ │ │ └── color-name@1.1.4
│ │ │ │ └─┬ supports-color@7.2.0
│ │ │ │ └── has-flag@4.0.0
│ │ │ ├── emittery@0.13.1 deduped
│ │ │ ├── jest-util@29.7.0 deduped
│ │ │ └── string-length@4.0.2 deduped
│ │ ├─┬ micromatch@4.0.5
│ │ │ ├── braces@3.0.2 deduped
│ │ │ └── picomatch@2.3.1 deduped
│ │ ├── UNMET OPTIONAL DEPENDENCY node-notifier@^8.0.1 || ^9.0.0 || ^10.0.0
│ │ ├── pretty-format@29.7.0 deduped
│ │ ├── slash@3.0.0
│ │ └── strip-ansi@6.0.1 deduped
│ ├─┬ @jest/types@29.6.3
│ │ ├── @jest/schemas@29.6.3 deduped
│ │ ├── @types/istanbul-lib-coverage@2.0.6
│ │ ├─┬ @types/istanbul-reports@3.0.4
│ │ │ └─┬ @types/istanbul-lib-report@3.0.3
│ │ │ └── @types/istanbul-lib-coverage@2.0.6 deduped
│ │ ├── @types/node@20.10.0 deduped
│ │ ├─┬ @types/yargs@17.0.32
│ │ │ └── @types/yargs-parser@21.0.3
│ │ └─┬ chalk@4.1.2
│ │ ├─┬ ansi-styles@4.3.0
│ │ │ └─┬ color-convert@2.0.1
│ │ │ └── color-name@1.1.4
│ │ └─┬ supports-color@7.2.0
│ │ └── has-flag@4.0.0
│ ├─┬ import-local@3.1.0
│ │ ├─┬ pkg-dir@4.2.0
│ │ │ └─┬ find-up@4.1.0
│ │ │ ├─┬ locate-path@5.0.0
│ │ │ │ └─┬ p-locate@4.1.0
│ │ │ │ └─┬ p-limit@2.3.0
│ │ │ │ └── p-try@2.2.0
│ │ │ └── path-exists@4.0.0 deduped
│ │ └─┬ resolve-cwd@3.0.0
│ │ └── resolve-from@5.0.0
│ ├─┬ jest-cli@29.7.0
│ │ ├── @jest/core@29.7.0 deduped
│ │ ├── @jest/test-result@29.7.0 deduped
│ │ ├── @jest/types@29.6.3 deduped
│ │ ├─┬ chalk@4.1.2
│ │ │ ├─┬ ansi-styles@4.3.0
│ │ │ │ └─┬ color-convert@2.0.1
│ │ │ │ └── color-name@1.1.4
│ │ │ └─┬ supports-color@7.2.0
│ │ │ └── has-flag@4.0.0
│ │ ├─┬ create-jest@29.7.0
│ │ │ ├── @jest/types@29.6.3 deduped
│ │ │ ├─┬ chalk@4.1.2
│ │ │ │ ├─┬ ansi-styles@4.3.0
│ │ │ │ │ └─┬ color-convert@2.0.1
│ │ │ │ │ └── color-name@1.1.4
│ │ │ │ └─┬ supports-color@7.2.0
│ │ │ │ └── has-flag@4.0.0
│ │ │ ├── exit@0.1.2 deduped
│ │ │ ├── graceful-fs@4.2.11 deduped
│ │ │ ├── jest-config@29.7.0 deduped
│ │ │ ├── jest-util@29.7.0 deduped
│ │ │ └─┬ prompts@2.4.2
│ │ │ ├── kleur@3.0.3
│ │ │ └── sisteransi@1.0.5 deduped
│ │ ├── exit@0.1.2 deduped
│ │ ├── import-local@3.1.0 deduped
│ │ ├── jest-config@29.7.0 deduped
│ │ ├── jest-util@29.7.0 deduped
│ │ ├── jest-validate@29.7.0 deduped
│ │ ├── UNMET OPTIONAL DEPENDENCY node-notifier@^8.0.1 || ^9.0.0 || ^10.0.0
│ │ └── yargs@17.7.2 deduped
│ └── UNMET OPTIONAL DEPENDENCY node-notifier@^8.0.1 || ^9.0.0 || ^10.0.0
├─┬ jsonwebtoken@9.0.2
│ ├─┬ jws@3.2.2
│ │ ├─┬ jwa@1.4.1
│ │ │ ├── buffer-equal-constant-time@1.0.1
│ │ │ ├─┬ ecdsa-sig-formatter@1.0.11
│ │ │ │ └── safe-buffer@5.1.2 deduped
│ │ │ └── safe-buffer@5.1.2 deduped
│ │ └── safe-buffer@5.1.2 deduped
│ ├── lodash.includes@4.3.0
│ ├── lodash.isboolean@3.0.3
│ ├── lodash.isinteger@4.0.4
│ ├── lodash.isnumber@3.0.3
│ ├── lodash.isplainobject@4.0.6
│ ├── lodash.isstring@4.0.1
│ ├── lodash.once@4.1.1
│ ├── ms@2.1.2
│ └── semver@7.5.4 deduped
├── lodash@4.17.21
├─┬ lusca@1.7.0
│ └── tsscmp@1.0.6
├── moment@2.29.4
├─┬ mongodb@6.3.0
│ ├── UNMET OPTIONAL DEPENDENCY @aws-sdk/credential-providers@^3.188.0
│ ├─┬ @mongodb-js/saslprep@1.1.1
│ │ └─┬ sparse-bitfield@3.0.3
│ │ └── memory-pager@1.5.0
│ ├── UNMET OPTIONAL DEPENDENCY @mongodb-js/zstd@^1.1.0
│ ├── bson@6.2.0
│ ├── UNMET OPTIONAL DEPENDENCY gcp-metadata@^5.2.0
│ ├── UNMET OPTIONAL DEPENDENCY kerberos@^2.0.1
│ ├── UNMET OPTIONAL DEPENDENCY mongodb-client-encryption@>=6.0.0 <7
│ ├─┬ mongodb-connection-string-url@3.0.0
│ │ ├─┬ @types/whatwg-url@11.0.3
│ │ │ └── @types/webidl-conversions@7.0.3
│ │ └─┬ whatwg-url@13.0.0
│ │ ├─┬ tr46@4.1.1
│ │ │ └── punycode@2.3.1 deduped
│ │ └── webidl-conversions@7.0.0
│ ├── UNMET OPTIONAL DEPENDENCY snappy@^7.2.2
│ └─┬ socks@2.7.1
│ ├── ip@2.0.0
│ └── smart-buffer@4.2.0
├── nodemailer@6.9.7
├─┬ nodemon@3.0.1
│ ├─┬ chokidar@3.5.3
│ │ ├─┬ anymatch@3.1.3
│ │ │ ├── normalize-path@3.0.0 deduped
│ │ │ └── picomatch@2.3.1 deduped
│ │ ├─┬ braces@3.0.2
│ │ │ └─┬ fill-range@7.0.1
│ │ │ └─┬ to-regex-range@5.0.1
│ │ │ └── is-number@7.0.0
│ │ ├── UNMET OPTIONAL DEPENDENCY fsevents@~2.3.2
│ │ ├─┬ glob-parent@5.1.2
│ │ │ └── is-glob@4.0.3 deduped
│ │ ├─┬ is-binary-path@2.1.0
│ │ │ └── binary-extensions@2.2.0
│ │ ├── is-glob@4.0.3 deduped
│ │ ├── normalize-path@3.0.0
│ │ └─┬ readdirp@3.6.0
│ │ └── picomatch@2.3.1 deduped
│ ├─┬ debug@3.2.7
│ │ └── ms@2.1.2 deduped
│ ├── ignore-by-default@1.0.1
│ ├── minimatch@3.1.2 deduped
│ ├── pstree.remy@1.1.8
│ ├── semver@7.5.4 deduped
│ ├─┬ simple-update-notifier@2.0.0
│ │ └── semver@7.5.4 deduped
│ ├─┬ supports-color@5.5.0
│ │ └── has-flag@3.0.0
│ ├─┬ touch@3.1.0
│ │ └─┬ nopt@1.0.10
│ │ └── abbrev@1.1.1
│ └── undefsafe@2.0.5
├─┬ npm-check-updates@16.14.11
│ ├── chalk@5.3.0
│ ├─┬ cli-table3@0.6.3
│ │ ├── @colors/colors@1.5.0
│ │ └── string-width@4.2.3 deduped
│ ├── commander@10.0.1
│ ├── fast-memoize@2.5.2
│ ├── find-up@5.0.0 deduped
│ ├── fp-and-or@0.1.4
│ ├── get-stdin@8.0.0
│ ├─┬ globby@11.1.0
│ │ ├── array-union@2.1.0
│ │ ├─┬ dir-glob@3.0.1
│ │ │ └── path-type@4.0.0
│ │ ├─┬ fast-glob@3.3.2
│ │ │ ├── @nodelib/fs.stat@2.0.5 deduped
│ │ │ ├── @nodelib/fs.walk@1.2.8 deduped
│ │ │ ├── glob-parent@5.1.2 deduped
│ │ │ ├── merge2@1.4.1 deduped
│ │ │ └── micromatch@4.0.5 deduped
│ │ ├── ignore@5.3.0 deduped
│ │ ├── merge2@1.4.1
│ │ └── slash@3.0.0
│ ├─┬ hosted-git-info@5.2.1
│ │ └── lru-cache@7.18.3
│ ├── ini@4.1.1
│ ├── js-yaml@4.1.0 deduped
│ ├─┬ json-parse-helpfulerror@1.0.3
│ │ └── jju@1.4.0
│ ├── jsonlines@0.1.1
│ ├── lodash@4.17.21 deduped
│ ├─┬ make-fetch-happen@11.1.1
│ │ ├─┬ agentkeepalive@4.5.0
│ │ │ └─┬ humanize-ms@1.2.1
│ │ │ └── ms@2.1.2 deduped
│ │ ├─┬ cacache@17.1.4
│ │ │ ├─┬ @npmcli/fs@3.1.0
│ │ │ │ └── semver@7.5.4 deduped
│ │ │ ├── fs-minipass@3.0.3 deduped
│ │ │ ├─┬ glob@10.3.10
│ │ │ │ ├── foreground-child@3.1.1 deduped
│ │ │ │ ├── jackspeak@2.3.6 deduped
│ │ │ │ ├─┬ minimatch@9.0.3
│ │ │ │ │ └─┬ brace-expansion@2.0.1
│ │ │ │ │ └── balanced-match@1.0.2 deduped
│ │ │ │ ├── minipass@7.0.4 deduped
│ │ │ │ └── path-scurry@1.10.1 deduped
│ │ │ ├── lru-cache@7.18.3
│ │ │ ├─┬ minipass-collect@1.0.2
│ │ │ │ └─┬ minipass@3.3.6
│ │ │ │ └── yallist@4.0.0
│ │ │ ├── minipass-flush@1.0.5 deduped
│ │ │ ├── minipass-pipeline@1.2.4 deduped
│ │ │ ├── minipass@7.0.4
│ │ │ ├── p-map@4.0.0 deduped
│ │ │ ├── ssri@10.0.5 deduped
│ │ │ ├── tar@6.2.0 deduped
│ │ │ └─┬ unique-filename@3.0.0
│ │ │ └─┬ unique-slug@4.0.0
│ │ │ └── imurmurhash@0.1.4 deduped
│ │ ├── http-cache-semantics@4.1.1
│ │ ├─┬ http-proxy-agent@5.0.0
│ │ │ ├── @tootallnate/once@2.0.0
│ │ │ ├─┬ agent-base@6.0.2
│ │ │ │ └── debug@4.3.4 deduped
│ │ │ └── debug@4.3.4 deduped
│ │ ├─┬ https-proxy-agent@5.0.1
│ │ │ ├─┬ agent-base@6.0.2
│ │ │ │ └── debug@4.3.4 deduped
│ │ │ └── debug@4.3.4 deduped
│ │ ├── is-lambda@1.0.1
│ │ ├── lru-cache@7.18.3
│ │ ├─┬ minipass-fetch@3.0.4
│ │ │ ├── encoding@0.1.13 deduped
│ │ │ ├─┬ minipass-sized@1.0.3
│ │ │ │ └─┬ minipass@3.3.6
│ │ │ │ └── yallist@4.0.0
│ │ │ ├── minipass@7.0.4
│ │ │ └─┬ minizlib@2.1.2
│ │ │ ├─┬ minipass@3.3.6
│ │ │ │ └── yallist@4.0.0 deduped
│ │ │ └── yallist@4.0.0
│ │ ├─┬ minipass-flush@1.0.5
│ │ │ └─┬ minipass@3.3.6
│ │ │ └── yallist@4.0.0
│ │ ├─┬ minipass-pipeline@1.2.4
│ │ │ └─┬ minipass@3.3.6
│ │ │ └── yallist@4.0.0
│ │ ├── minipass@5.0.0
│ │ ├── negotiator@0.6.3 deduped
│ │ ├─┬ promise-retry@2.0.1
│ │ │ ├── err-code@2.0.3
│ │ │ └── retry@0.12.0
│ │ ├─┬ socks-proxy-agent@7.0.0
│ │ │ ├─┬ agent-base@6.0.2
│ │ │ │ └── debug@4.3.4 deduped
│ │ │ ├── debug@4.3.4 deduped
│ │ │ └── socks@2.7.1 deduped
│ │ └─┬ ssri@10.0.5
│ │ └── minipass@7.0.4
│ ├─┬ minimatch@9.0.3
│ │ └─┬ brace-expansion@2.0.1
│ │ └── balanced-match@1.0.2 deduped
│ ├─┬ p-map@4.0.0
│ │ └─┬ aggregate-error@3.1.0
│ │ ├── clean-stack@2.2.0
│ │ └── indent-string@4.0.0
│ ├─┬ pacote@15.2.0
│ │ ├─┬ @npmcli/git@4.1.0
│ │ │ ├── @npmcli/promise-spawn@6.0.2 deduped
│ │ │ ├── lru-cache@7.18.3
│ │ │ ├── npm-pick-manifest@8.0.2 deduped
│ │ │ ├── proc-log@3.0.0 deduped
│ │ │ ├── promise-inflight@1.0.1
│ │ │ ├── promise-retry@2.0.1 deduped
│ │ │ ├── semver@7.5.4 deduped
│ │ │ └─┬ which@3.0.1
│ │ │ └── isexe@2.0.0 deduped
│ │ ├─┬ @npmcli/installed-package-contents@2.0.2
│ │ │ ├─┬ npm-bundled@3.0.0
│ │ │ │ └── npm-normalize-package-bin@3.0.1 deduped
│ │ │ └── npm-normalize-package-bin@3.0.1
│ │ ├─┬ @npmcli/promise-spawn@6.0.2
│ │ │ └─┬ which@3.0.1
│ │ │ └── isexe@2.0.0 deduped
│ │ ├─┬ @npmcli/run-script@6.0.2
│ │ │ ├── @npmcli/node-gyp@3.0.0
│ │ │ ├── @npmcli/promise-spawn@6.0.2 deduped
│ │ │ ├─┬ node-gyp@9.4.1
│ │ │ │ ├── env-paths@2.2.1
│ │ │ │ ├── exponential-backoff@3.1.1
│ │ │ │ ├── glob@7.2.3 deduped
│ │ │ │ ├── graceful-fs@4.2.11 deduped
│ │ │ │ ├─┬ make-fetch-happen@10.2.1
│ │ │ │ │ ├── agentkeepalive@4.5.0 deduped
│ │ │ │ │ ├─┬ cacache@16.1.3
│ │ │ │ │ │ ├─┬ @npmcli/fs@2.1.2
│ │ │ │ │ │ │ ├── @gar/promisify@1.1.3
│ │ │ │ │ │ │ └── semver@7.5.4 deduped
│ │ │ │ │ │ ├─┬ @npmcli/move-file@2.0.1
│ │ │ │ │ │ │ ├── mkdirp@1.0.4 deduped
│ │ │ │ │ │ │ └── rimraf@3.0.2 deduped
│ │ │ │ │ │ ├── chownr@2.0.0 deduped
│ │ │ │ │ │ ├─┬ fs-minipass@2.1.0
│ │ │ │ │ │ │ └── minipass@3.3.6 deduped
│ │ │ │ │ │ ├─┬ glob@8.1.0
│ │ │ │ │ │ │ ├── fs.realpath@1.0.0 deduped
│ │ │ │ │ │ │ ├── inflight@1.0.6 deduped
│ │ │ │ │ │ │ ├── inherits@2.0.4 deduped
│ │ │ │ │ │ │ ├─┬ minimatch@5.1.6
│ │ │ │ │ │ │ │ └─┬ brace-expansion@2.0.1
│ │ │ │ │ │ │ │ └── balanced-match@1.0.2 deduped
│ │ │ │ │ │ │ └── once@1.4.0 deduped
│ │ │ │ │ │ ├── infer-owner@1.0.4
│ │ │ │ │ │ ├── lru-cache@7.18.3 deduped
│ │ │ │ │ │ ├── minipass-collect@1.0.2 deduped
│ │ │ │ │ │ ├── minipass-flush@1.0.5 deduped
│ │ │ │ │ │ ├── minipass-pipeline@1.2.4 deduped
│ │ │ │ │ │ ├── minipass@3.3.6 deduped
│ │ │ │ │ │ ├── mkdirp@1.0.4 deduped
│ │ │ │ │ │ ├── p-map@4.0.0 deduped
│ │ │ │ │ │ ├── promise-inflight@1.0.1 deduped
│ │ │ │ │ │ ├── rimraf@3.0.2 deduped
│ │ │ │ │ │ ├── ssri@9.0.1 deduped
│ │ │ │ │ │ ├── tar@6.2.0 deduped
│ │ │ │ │ │ └─┬ unique-filename@2.0.1
│ │ │ │ │ │ └─┬ unique-slug@3.0.0
│ │ │ │ │ │ └── imurmurhash@0.1.4 deduped
│ │ │ │ │ ├── http-cache-semantics@4.1.1 deduped
│ │ │ │ │ ├── http-proxy-agent@5.0.0 deduped
│ │ │ │ │ ├─┬ https-proxy-agent@5.0.1
│ │ │ │ │ │ ├─┬ agent-base@6.0.2
│ │ │ │ │ │ │ └── debug@4.3.4 deduped
│ │ │ │ │ │ └── debug@4.3.4 deduped
│ │ │ │ │ ├── is-lambda@1.0.1 deduped
│ │ │ │ │ ├── lru-cache@7.18.3
│ │ │ │ │ ├── minipass-collect@1.0.2 deduped
│ │ │ │ │ ├─┬ minipass-fetch@2.1.2
│ │ │ │ │ │ ├── encoding@0.1.13 deduped
│ │ │ │ │ │ ├── minipass-sized@1.0.3 deduped
│ │ │ │ │ │ ├── minipass@3.3.6 deduped
│ │ │ │ │ │ └── minizlib@2.1.2 deduped
│ │ │ │ │ ├── minipass-flush@1.0.5 deduped
│ │ │ │ │ ├── minipass-pipeline@1.2.4 deduped
│ │ │ │ │ ├─┬ minipass@3.3.6
│ │ │ │ │ │ └── yallist@4.0.0
│ │ │ │ │ ├── negotiator@0.6.3 deduped
│ │ │ │ │ ├── promise-retry@2.0.1 deduped
│ │ │ │ │ ├── socks-proxy-agent@7.0.0 deduped
│ │ │ │ │ └─┬ ssri@9.0.1
│ │ │ │ │ └── minipass@3.3.6 deduped
│ │ │ │ ├─┬ nopt@6.0.0
│ │ │ │ │ └── abbrev@1.1.1 deduped
│ │ │ │ ├─┬ npmlog@6.0.2
│ │ │ │ │ ├─┬ are-we-there-yet@3.0.1
│ │ │ │ │ │ ├── delegates@1.0.0
│ │ │ │ │ │ └── readable-stream@3.6.2 deduped
│ │ │ │ │ ├── console-control-strings@1.1.0
│ │ │ │ │ ├─┬ gauge@4.0.4
│ │ │ │ │ │ ├── aproba@2.0.0
│ │ │ │ │ │ ├── color-support@1.1.3
│ │ │ │ │ │ ├── console-control-strings@1.1.0 deduped
│ │ │ │ │ │ ├── has-unicode@2.0.1
│ │ │ │ │ │ ├── signal-exit@3.0.7 deduped
│ │ │ │ │ │ ├── string-width@4.2.3 deduped
│ │ │ │ │ │ ├── strip-ansi@6.0.1 deduped
│ │ │ │ │ │ └─┬ wide-align@1.1.5
│ │ │ │ │ │ └── string-width@4.2.3 deduped
│ │ │ │ │ └── set-blocking@2.0.0
│ │ │ │ ├── rimraf@3.0.2 deduped
│ │ │ │ ├── semver@7.5.4 deduped
│ │ │ │ ├── tar@6.2.0 deduped
│ │ │ │ └── which@2.0.2 deduped
│ │ │ ├── read-package-json-fast@3.0.2 deduped
│ │ │ └─┬ which@3.0.1
│ │ │ └── isexe@2.0.0 deduped
│ │ ├── cacache@17.1.4 deduped
│ │ ├─┬ fs-minipass@3.0.3
│ │ │ └── minipass@7.0.4
│ │ ├── minipass@5.0.0 deduped
│ │ ├─┬ npm-package-arg@10.1.0
│ │ │ ├─┬ hosted-git-info@6.1.1
│ │ │ │ └── lru-cache@7.18.3
│ │ │ ├── proc-log@3.0.0 deduped
│ │ │ ├── semver@7.5.4 deduped
│ │ │ └─┬ validate-npm-package-name@5.0.0
│ │ │ └── builtins@5.0.1 deduped
│ │ ├─┬ npm-packlist@7.0.4
│ │ │ └─┬ ignore-walk@6.0.3
│ │ │ └─┬ minimatch@9.0.3
│ │ │ └─┬ brace-expansion@2.0.1
│ │ │ └── balanced-match@1.0.2 deduped
│ │ ├─┬ npm-pick-manifest@8.0.2
│ │ │ ├─┬ npm-install-checks@6.3.0
│ │ │ │ └── semver@7.5.4 deduped
│ │ │ ├── npm-normalize-package-bin@3.0.1 deduped
│ │ │ ├── npm-package-arg@10.1.0 deduped
│ │ │ └── semver@7.5.4 deduped
│ │ ├─┬ npm-registry-fetch@14.0.5
│ │ │ ├── make-fetch-happen@11.1.1 deduped
│ │ │ ├── minipass-fetch@3.0.4 deduped
│ │ │ ├─┬ minipass-json-stream@1.0.1
│ │ │ │ ├── jsonparse@1.3.1
│ │ │ │ └─┬ minipass@3.3.6
│ │ │ │ └── yallist@4.0.0
│ │ │ ├── minipass@5.0.0 deduped
│ │ │ ├── minizlib@2.1.2 deduped
│ │ │ ├── npm-package-arg@10.1.0 deduped
│ │ │ └── proc-log@3.0.0 deduped
│ │ ├── proc-log@3.0.0
│ │ ├── promise-retry@2.0.1 deduped
│ │ ├─┬ read-package-json-fast@3.0.2
│ │ │ ├── json-parse-even-better-errors@3.0.1
│ │ │ └── npm-normalize-package-bin@3.0.1 deduped
│ │ ├─┬ read-package-json@6.0.4
│ │ │ ├─┬ glob@10.3.10
│ │ │ │ ├── foreground-child@3.1.1 deduped
│ │ │ │ ├── jackspeak@2.3.6 deduped
│ │ │ │ ├─┬ minimatch@9.0.3
│ │ │ │ │ └─┬ brace-expansion@2.0.1
│ │ │ │ │ └── balanced-match@1.0.2 deduped
│ │ │ │ ├── minipass@5.0.0 deduped
│ │ │ │ └── path-scurry@1.10.1 deduped
│ │ │ ├── json-parse-even-better-errors@3.0.1
│ │ │ ├─┬ normalize-package-data@5.0.0
│ │ │ │ ├─┬ hosted-git-info@6.1.1
│ │ │ │ │ └── lru-cache@7.18.3
│ │ │ │ ├── is-core-module@2.13.1 deduped
│ │ │ │ ├── semver@7.5.4 deduped
│ │ │ │ └─┬ validate-npm-package-license@3.0.4
│ │ │ │ ├─┬ spdx-correct@3.2.0
│ │ │ │ │ ├── spdx-expression-parse@3.0.1 deduped
│ │ │ │ │ └── spdx-license-ids@3.0.16
│ │ │ │ └─┬ spdx-expression-parse@3.0.1
│ │ │ │ ├── spdx-exceptions@2.3.0
│ │ │ │ └── spdx-license-ids@3.0.16 deduped
│ │ │ └── npm-normalize-package-bin@3.0.1 deduped
│ │ ├─┬ sigstore@1.9.0
│ │ │ ├─┬ @sigstore/bundle@1.1.0
│ │ │ │ └── @sigstore/protobuf-specs@0.2.1 deduped
│ │ │ ├── @sigstore/protobuf-specs@0.2.1
│ │ │ ├─┬ @sigstore/sign@1.0.0
│ │ │ │ ├── @sigstore/bundle@1.1.0 deduped
│ │ │ │ ├── @sigstore/protobuf-specs@0.2.1 deduped
│ │ │ │ └── make-fetch-happen@11.1.1 deduped
│ │ │ ├─┬ @sigstore/tuf@1.0.3
│ │ │ │ ├── @sigstore/protobuf-specs@0.2.1 deduped
│ │ │ │ └─┬ tuf-js@1.1.7
│ │ │ │ ├─┬ @tufjs/models@1.0.4
│ │ │ │ │ ├── @tufjs/canonical-json@1.0.0
│ │ │ │ │ └─┬ minimatch@9.0.3
│ │ │ │ │ └─┬ brace-expansion@2.0.1
│ │ │ │ │ └── balanced-match@1.0.2 deduped
│ │ │ │ ├── debug@4.3.4 deduped
│ │ │ │ └── make-fetch-happen@11.1.1 deduped
│ │ │ └── make-fetch-happen@11.1.1 deduped
│ │ ├── ssri@10.0.5 deduped
│ │ └─┬ tar@6.2.0
│ │ ├── chownr@2.0.0
│ │ ├─┬ fs-minipass@2.1.0
│ │ │ └─┬ minipass@3.3.6
│ │ │ └── yallist@4.0.0 deduped
│ │ ├── minipass@5.0.0 deduped
│ │ ├── minizlib@2.1.2 deduped
│ │ ├── mkdirp@1.0.4
│ │ └── yallist@4.0.0
│ ├── parse-github-url@1.0.2
│ ├── progress@2.0.3
│ ├─┬ prompts-ncu@3.0.0
│ │ ├── kleur@4.1.5
│ │ └── sisteransi@1.0.5
│ ├─┬ rc-config-loader@4.1.3
│ │ ├── debug@4.3.4 deduped
│ │ ├── js-yaml@4.1.0 deduped
│ │ ├── json5@2.2.3 deduped
│ │ └── require-from-string@2.0.2
│ ├── remote-git-tags@3.0.0
│ ├─┬ rimraf@5.0.5
│ │ └─┬ glob@10.3.10
│ │ ├─┬ foreground-child@3.1.1
│ │ │ ├── cross-spawn@7.0.3 deduped
│ │ │ └── signal-exit@4.1.0
│ │ ├─┬ jackspeak@2.3.6
│ │ │ ├─┬ @isaacs/cliui@8.0.2
│ │ │ │ ├─┬ string-width-cjs@npm:string-width@4.2.3
│ │ │ │ │ ├── emoji-regex@8.0.0 deduped
│ │ │ │ │ ├── is-fullwidth-code-point@3.0.0 deduped
│ │ │ │ │ └── strip-ansi@6.0.1 deduped
│ │ │ │ ├─┬ string-width@5.1.2
│ │ │ │ │ ├── eastasianwidth@0.2.0 deduped
│ │ │ │ │ ├── emoji-regex@9.2.2
│ │ │ │ │ └── strip-ansi@7.1.0 deduped
│ │ │ │ ├─┬ strip-ansi-cjs@npm:strip-ansi@6.0.1
│ │ │ │ │ └── ansi-regex@5.0.1 deduped
│ │ │ │ ├─┬ strip-ansi@7.1.0
│ │ │ │ │ └── ansi-regex@6.0.1
│ │ │ │ ├─┬ wrap-ansi-cjs@npm:wrap-ansi@7.0.0
│ │ │ │ │ ├─┬ ansi-styles@4.3.0
│ │ │ │ │ │ └─┬ color-convert@2.0.1
│ │ │ │ │ │ └── color-name@1.1.4
│ │ │ │ │ ├── string-width@4.2.3 deduped
│ │ │ │ │ └── strip-ansi@6.0.1 deduped
│ │ │ │ └── wrap-ansi@8.1.0 deduped
│ │ │ └── @pkgjs/parseargs@0.11.0
│ │ ├── minimatch@9.0.3 deduped
│ │ ├── minipass@5.0.0 deduped
│ │ └─┬ path-scurry@1.10.1
│ │ ├── lru-cache@10.1.0
│ │ └── minipass@5.0.0 deduped
│ ├── semver-utils@1.1.4
│ ├── semver@7.5.4 deduped
│ ├─┬ source-map-support@0.5.21
│ │ ├── buffer-from@1.1.2
│ │ └── source-map@0.6.1
│ ├─┬ spawn-please@2.0.2
│ │ └── cross-spawn@7.0.3 deduped
│ ├─┬ strip-ansi@7.1.0
│ │ └── ansi-regex@6.0.1
│ ├── strip-json-comments@5.0.1
│ ├── untildify@4.0.0
│ └─┬ update-notifier@6.0.2
│ ├─┬ boxen@7.1.1
│ │ ├─┬ ansi-align@3.0.1
│ │ │ └── string-width@4.2.3 deduped
│ │ ├── camelcase@7.0.1
│ │ ├── chalk@5.3.0
│ │ ├── cli-boxes@3.0.0
│ │ ├─┬ string-width@5.1.2
│ │ │ ├── eastasianwidth@0.2.0
│ │ │ ├── emoji-regex@9.2.2
│ │ │ └─┬ strip-ansi@7.1.0
│ │ │ └── ansi-regex@6.0.1
│ │ ├── type-fest@2.19.0
│ │ ├─┬ widest-line@4.0.1
│ │ │ └─┬ string-width@5.1.2
│ │ │ ├── eastasianwidth@0.2.0 deduped
│ │ │ ├── emoji-regex@9.2.2
│ │ │ └─┬ strip-ansi@7.1.0
│ │ │ └── ansi-regex@6.0.1
│ │ └─┬ wrap-ansi@8.1.0
│ │ ├── ansi-styles@6.2.1
│ │ ├─┬ string-width@5.1.2
│ │ │ ├── eastasianwidth@0.2.0 deduped
│ │ │ ├── emoji-regex@9.2.2
│ │ │ └── strip-ansi@7.1.0 deduped
│ │ └─┬ strip-ansi@7.1.0
│ │ └── ansi-regex@6.0.1
│ ├── chalk@5.3.0
│ ├─┬ configstore@6.0.0
│ │ ├─┬ dot-prop@6.0.1
│ │ │ └── is-obj@2.0.0
│ │ ├── graceful-fs@4.2.11 deduped
│ │ ├─┬ unique-string@3.0.0
│ │ │ └─┬ crypto-random-string@4.0.0
│ │ │ └── type-fest@1.4.0
│ │ ├─┬ write-file-atomic@3.0.3
│ │ │ ├── imurmurhash@0.1.4 deduped
│ │ │ ├── is-typedarray@1.0.0 deduped
│ │ │ ├── signal-exit@3.0.7 deduped
│ │ │ └─┬ typedarray-to-buffer@3.1.5
│ │ │ └── is-typedarray@1.0.0 deduped
│ │ └── xdg-basedir@5.1.0 deduped
│ ├── has-yarn@3.0.0
│ ├── import-lazy@4.0.0
│ ├─┬ is-ci@3.0.1
│ │ └── ci-info@3.9.0 deduped
│ ├─┬ is-installed-globally@0.4.0
│ │ ├─┬ global-dirs@3.0.1
│ │ │ └── ini@2.0.0
│ │ └── is-path-inside@3.0.3 deduped
│ ├── is-npm@6.0.0
│ ├── is-yarn-global@0.4.1
│ ├─┬ latest-version@7.0.0
│ │ └─┬ package-json@8.1.1
│ │ ├─┬ got@12.6.1
│ │ │ ├── @sindresorhus/is@5.6.0
│ │ │ ├─┬ @szmarczak/http-timer@5.0.1
│ │ │ │ └── defer-to-connect@2.0.1
│ │ │ ├── cacheable-lookup@7.0.0
│ │ │ ├─┬ cacheable-request@10.2.14
│ │ │ │ ├── @types/http-cache-semantics@4.0.4
│ │ │ │ ├── get-stream@6.0.1 deduped
│ │ │ │ ├── http-cache-semantics@4.1.1 deduped
│ │ │ │ ├── keyv@4.5.4 deduped
│ │ │ │ ├── mimic-response@4.0.0
│ │ │ │ ├── normalize-url@8.0.0
│ │ │ │ └── responselike@3.0.0 deduped
│ │ │ ├── decompress-response@6.0.0 deduped
│ │ │ ├── form-data-encoder@2.1.4
│ │ │ ├── get-stream@6.0.1 deduped
│ │ │ ├─┬ http2-wrapper@2.2.1
│ │ │ │ ├── quick-lru@5.1.1
│ │ │ │ └── resolve-alpn@1.2.1
│ │ │ ├── lowercase-keys@3.0.0
│ │ │ ├── p-cancelable@3.0.0
│ │ │ └─┬ responselike@3.0.0
│ │ │ └── lowercase-keys@3.0.0 deduped
│ │ ├─┬ registry-auth-token@5.0.2
│ │ │ └─┬ @pnpm/npm-conf@2.2.2
│ │ │ ├── @pnpm/config.env-replace@1.1.0
│ │ │ ├─┬ @pnpm/network.ca-file@1.0.2
│ │ │ │ └── graceful-fs@4.2.10
│ │ │ └─┬ config-chain@1.1.13
│ │ │ ├── ini@1.3.8
│ │ │ └── proto-list@1.2.4
│ │ ├─┬ registry-url@6.0.1
│ │ │ └── rc@1.2.8 deduped
│ │ └── semver@7.5.4 deduped
│ ├─┬ pupa@3.1.0
│ │ └── escape-goat@4.0.0
│ ├─┬ semver-diff@4.0.0
│ │ └── semver@7.5.4 deduped
│ ├── semver@7.5.4 deduped
│ └── xdg-basedir@5.1.0
├─┬ passport-facebook@3.0.0
│ └─┬ passport-oauth2@1.7.0
│ ├── base64url@3.0.1
│ ├── oauth@0.9.15
│ ├── passport-strategy@1.0.0 deduped
│ ├── uid2@0.0.4
│ └── utils-merge@1.0.1 deduped
├─┬ passport-local@1.0.0
│ └── passport-strategy@1.0.0
├─┬ passport@0.7.0
│ ├── passport-strategy@1.0.0 deduped
│ ├── pause@0.0.1
│ └── utils-merge@1.0.1 deduped
├─┬ pretty-format@29.7.0
│ ├─┬ @jest/schemas@29.6.3
│ │ └── @sinclair/typebox@0.27.8
│ ├── ansi-styles@5.2.0
│ └── react-is@18.2.0
├─┬ pug@3.0.2
│ ├─┬ pug-code-gen@3.0.2
│ │ ├─┬ constantinople@4.0.1
│ │ │ ├── @babel/parser@7.23.4 deduped
│ │ │ └── @babel/types@7.23.4 deduped
│ │ ├── doctypes@1.1.0
│ │ ├── js-stringify@1.0.2
│ │ ├─┬ pug-attrs@3.0.0
│ │ │ ├── constantinople@4.0.1 deduped
│ │ │ ├── js-stringify@1.0.2 deduped
│ │ │ └── pug-runtime@3.0.1 deduped
│ │ ├── pug-error@2.0.0
│ │ ├── pug-runtime@3.0.1 deduped
│ │ ├── void-elements@3.1.0
│ │ └─┬ with@7.0.2
│ │ ├── @babel/parser@7.23.4 deduped
│ │ ├── @babel/types@7.23.4 deduped
│ │ ├── assert-never@1.2.1
│ │ └─┬ babel-walk@3.0.0-canary-5
│ │ └── @babel/types@7.23.4 deduped
│ ├─┬ pug-filters@4.0.0
│ │ ├── constantinople@4.0.1 deduped
│ │ ├─┬ jstransformer@1.0.0
│ │ │ ├── is-promise@2.2.2
│ │ │ └─┬ promise@7.3.1
│ │ │ └── asap@2.0.6
│ │ ├── pug-error@2.0.0 deduped
│ │ ├── pug-walk@2.0.0
│ │ └── resolve@1.22.8 deduped
│ ├─┬ pug-lexer@5.0.1
│ │ ├─┬ character-parser@2.2.0
│ │ │ └── is-regex@1.1.4 deduped
│ │ ├─┬ is-expression@4.0.0
│ │ │ ├── acorn@7.4.1
│ │ │ └── object-assign@4.1.1 deduped
│ │ └── pug-error@2.0.0 deduped
│ ├─┬ pug-linker@4.0.0
│ │ ├── pug-error@2.0.0 deduped
│ │ └── pug-walk@2.0.0 deduped
│ ├─┬ pug-load@3.0.0
│ │ ├── object-assign@4.1.1 deduped
│ │ └── pug-walk@2.0.0 deduped
│ ├─┬ pug-parser@6.0.0
│ │ ├── pug-error@2.0.0 deduped
│ │ └── token-stream@1.0.0
│ ├── pug-runtime@3.0.1
│ └─┬ pug-strip-comments@2.0.0
│ └── pug-error@2.0.0 deduped
├─┬ realm-web@2.0.0
│ ├── @realm/common@0.1.4
│ ├─┬ abort-controller@3.0.0
│ │ └── event-target-shim@5.0.1
│ ├─┬ bson@4.7.2
│ │ └─┬ buffer@5.7.1
│ │ ├── base64-js@1.5.1
│ │ └── ieee754@1.2.1
│ ├── detect-browser@5.3.0
│ ├── js-base64@3.7.5
│ └─┬ node-fetch@2.7.0
│ ├─┬ encoding@0.1.13
│ │ └─┬ iconv-lite@0.6.3
│ │ └── safer-buffer@2.1.2 deduped
│ └─┬ whatwg-url@5.0.0
│ ├── tr46@0.0.3
│ └── webidl-conversions@3.0.1
├─┬ realm@12.3.1
│ ├─┬ bson@4.7.2
│ │ └── buffer@5.7.1 deduped
│ ├── debug@4.3.4 deduped
│ ├── node-fetch@2.7.0 deduped
│ ├── node-machine-id@1.1.12
│ ├─┬ prebuild-install@7.1.1
│ │ ├── detect-libc@2.0.2
│ │ ├── expand-template@2.0.3
│ │ ├── github-from-package@0.0.0
│ │ ├── minimist@1.2.8 deduped
│ │ ├── mkdirp-classic@0.5.3
│ │ ├── napi-build-utils@1.0.2
│ │ ├─┬ node-abi@3.51.0
│ │ │ └── semver@7.5.4 deduped
│ │ ├─┬ pump@3.0.0
│ │ │ ├─┬ end-of-stream@1.4.4
│ │ │ │ └── once@1.4.0 deduped
│ │ │ └── once@1.4.0 deduped
│ │ ├─┬ rc@1.2.8
│ │ │ ├── deep-extend@0.6.0
│ │ │ ├── ini@1.3.8
│ │ │ ├── minimist@1.2.8 deduped
│ │ │ └── strip-json-comments@2.0.1
│ │ ├─┬ simple-get@4.0.1
│ │ │ ├─┬ decompress-response@6.0.0
│ │ │ │ └── mimic-response@3.1.0
│ │ │ ├── once@1.4.0 deduped
│ │ │ └── simple-concat@1.0.1
│ │ ├─┬ tar-fs@2.1.1
│ │ │ ├── chownr@1.1.4
│ │ │ ├── mkdirp-classic@0.5.3 deduped
│ │ │ ├── pump@3.0.0 deduped
│ │ │ └─┬ tar-stream@2.2.0
│ │ │ ├─┬ bl@4.1.0
│ │ │ │ ├── buffer@5.7.1 deduped
│ │ │ │ ├── inherits@2.0.4 deduped
│ │ │ │ └── readable-stream@3.6.2 deduped
│ │ │ ├── end-of-stream@1.4.4 deduped
│ │ │ ├── fs-constants@1.0.0
│ │ │ ├── inherits@2.0.4 deduped
│ │ │ └── readable-stream@3.6.2 deduped
│ │ └── tunnel-agent@0.6.0 deduped
│ └── UNMET OPTIONAL DEPENDENCY react-native@>=0.71.0
├─┬ sass@1.69.5
│ ├── chokidar@3.5.3 deduped
│ ├── immutable@4.3.4
│ └── source-map-js@1.0.2
├─┬ semver@7.5.4
│ └─┬ lru-cache@6.0.0
│ └── yallist@4.0.0
├─┬ shelljs@0.8.5
│ ├─┬ glob@7.2.3
│ │ ├── fs.realpath@1.0.0
│ │ ├─┬ inflight@1.0.6
│ │ │ ├── once@1.4.0 deduped
│ │ │ └── wrappy@1.0.2
│ │ ├── inherits@2.0.4 deduped
│ │ ├── minimatch@3.1.2 deduped
│ │ ├─┬ once@1.4.0
│ │ │ └── wrappy@1.0.2 deduped
│ │ └── path-is-absolute@1.0.1
│ ├── interpret@1.4.0
│ └─┬ rechoir@0.6.2
│ └── resolve@1.22.8 deduped
├─┬ supertest@6.3.3
│ ├── methods@1.1.2 deduped
│ └─┬ superagent@8.1.2
│ ├── component-emitter@1.3.1
│ ├── cookiejar@2.1.4
│ ├── debug@4.3.4 deduped
│ ├── fast-safe-stringify@2.1.1
│ ├─┬ form-data@4.0.0
│ │ ├── asynckit@0.4.0 deduped
│ │ ├── combined-stream@1.0.8 deduped
│ │ └── mime-types@2.1.35 deduped
│ ├─┬ formidable@2.1.2
│ │ ├─┬ dezalgo@1.0.4
│ │ │ ├── asap@2.0.6 deduped
│ │ │ └── wrappy@1.0.2 deduped
│ │ ├── hexoid@1.0.0
│ │ ├── once@1.4.0 deduped
│ │ └── qs@6.11.0 deduped
│ ├── methods@1.1.2 deduped
│ ├── mime@2.6.0
│ ├── qs@6.11.0 deduped
│ └── semver@7.5.4 deduped
├─┬ ts-jest@29.1.1
│ ├─┬ @babel/core@7.23.3
│ │ ├─┬ @ampproject/remapping@2.2.1
│ │ │ ├─┬ @jridgewell/gen-mapping@0.3.3
│ │ │ │ ├── @jridgewell/set-array@1.1.2
│ │ │ │ ├── @jridgewell/sourcemap-codec@1.4.15 deduped
│ │ │ │ └── @jridgewell/trace-mapping@0.3.20 deduped
│ │ │ └── @jridgewell/trace-mapping@0.3.20 deduped
│ │ ├─┬ @babel/code-frame@7.23.4
│ │ │ ├─┬ @babel/highlight@7.23.4
│ │ │ │ ├── @babel/helper-validator-identifier@7.22.20 deduped
│ │ │ │ ├── chalk@2.4.2 deduped
│ │ │ │ └── js-tokens@4.0.0 deduped
│ │ │ └─┬ chalk@2.4.2
│ │ │ ├─┬ ansi-styles@3.2.1
│ │ │ │ └── color-convert@1.9.3 deduped
│ │ │ ├── escape-string-regexp@1.0.5
│ │ │ └── supports-color@5.5.0 deduped
│ │ ├─┬ @babel/generator@7.23.4
│ │ │ ├── @babel/types@7.23.4 deduped
│ │ │ ├── @jridgewell/gen-mapping@0.3.3 deduped
│ │ │ ├── @jridgewell/trace-mapping@0.3.20 deduped
│ │ │ └── jsesc@2.5.2
│ │ ├─┬ @babel/helper-compilation-targets@7.22.15
│ │ │ ├── @babel/compat-data@7.23.3
│ │ │ ├── @babel/helper-validator-option@7.22.15
│ │ │ ├─┬ browserslist@4.22.1
│ │ │ │ ├── caniuse-lite@1.0.30001565
│ │ │ │ ├── electron-to-chromium@1.4.596
│ │ │ │ ├── node-releases@2.0.13
│ │ │ │ └─┬ update-browserslist-db@1.0.13
│ │ │ │ ├── browserslist@4.22.1 deduped
│ │ │ │ ├── escalade@3.1.1 deduped
│ │ │ │ └── picocolors@1.0.0
│ │ │ ├─┬ lru-cache@5.1.1
│ │ │ │ └── yallist@3.1.1
│ │ │ └── semver@6.3.1
│ │ ├─┬ @babel/helper-module-transforms@7.23.3
│ │ │ ├── @babel/core@7.23.3 deduped
│ │ │ ├── @babel/helper-environment-visitor@7.22.20
│ │ │ ├─┬ @babel/helper-module-imports@7.22.15
│ │ │ │ └── @babel/types@7.23.4 deduped
│ │ │ ├─┬ @babel/helper-simple-access@7.22.5
│ │ │ │ └── @babel/types@7.23.4 deduped
│ │ │ ├─┬ @babel/helper-split-export-declaration@7.22.6
│ │ │ │ └── @babel/types@7.23.4 deduped
│ │ │ └── @babel/helper-validator-identifier@7.22.20
│ │ ├─┬ @babel/helpers@7.23.4
│ │ │ ├── @babel/template@7.22.15 deduped
│ │ │ ├── @babel/traverse@7.23.4 deduped
│ │ │ └── @babel/types@7.23.4 deduped
│ │ ├── @babel/parser@7.23.4
│ │ ├─┬ @babel/template@7.22.15
│ │ │ ├── @babel/code-frame@7.23.4 deduped
│ │ │ ├── @babel/parser@7.23.4 deduped
│ │ │ └── @babel/types@7.23.4 deduped
│ │ ├─┬ @babel/traverse@7.23.4
│ │ │ ├── @babel/code-frame@7.23.4 deduped
│ │ │ ├── @babel/generator@7.23.4 deduped
│ │ │ ├── @babel/helper-environment-visitor@7.22.20 deduped
│ │ │ ├─┬ @babel/helper-function-name@7.23.0
│ │ │ │ ├── @babel/template@7.22.15 deduped
│ │ │ │ └── @babel/types@7.23.4 deduped
│ │ │ ├─┬ @babel/helper-hoist-variables@7.22.5
│ │ │ │ └── @babel/types@7.23.4 deduped
│ │ │ ├── @babel/helper-split-export-declaration@7.22.6 deduped
│ │ │ ├── @babel/parser@7.23.4 deduped
│ │ │ ├── @babel/types@7.23.4 deduped
│ │ │ ├── debug@4.3.4 deduped
│ │ │ └── globals@11.12.0
│ │ ├─┬ @babel/types@7.23.4
│ │ │ ├── @babel/helper-string-parser@7.23.4
│ │ │ ├── @babel/helper-validator-identifier@7.22.20 deduped
│ │ │ └── to-fast-properties@2.0.0
│ │ ├── convert-source-map@2.0.0
│ │ ├── debug@4.3.4 deduped
│ │ ├── gensync@1.0.0-beta.2
│ │ ├── json5@2.2.3 deduped
│ │ └── semver@6.3.1
│ ├── @jest/types@29.6.3 deduped
│ ├─┬ babel-jest@29.7.0
│ │ ├── @babel/core@7.23.3 deduped
│ │ ├── @jest/transform@29.7.0 deduped
│ │ ├─┬ @types/babel__core@7.20.5
│ │ │ ├── @babel/parser@7.23.4 deduped
│ │ │ ├── @babel/types@7.23.4 deduped
│ │ │ ├─┬ @types/babel__generator@7.6.7
│ │ │ │ └── @babel/types@7.23.4 deduped
│ │ │ ├─┬ @types/babel__template@7.4.4
│ │ │ │ ├── @babel/parser@7.23.4 deduped
│ │ │ │ └── @babel/types@7.23.4 deduped
│ │ │ └─┬ @types/babel__traverse@7.20.4
│ │ │ └── @babel/types@7.23.4 deduped
│ │ ├─┬ babel-plugin-istanbul@6.1.1
│ │ │ ├── @babel/helper-plugin-utils@7.22.5
│ │ │ ├─┬ @istanbuljs/load-nyc-config@1.1.0
│ │ │ │ ├── camelcase@5.3.1
│ │ │ │ ├─┬ find-up@4.1.0
│ │ │ │ │ ├─┬ locate-path@5.0.0
│ │ │ │ │ │ └─┬ p-locate@4.1.0
│ │ │ │ │ │ └─┬ p-limit@2.3.0
│ │ │ │ │ │ └── p-try@2.2.0 deduped
│ │ │ │ │ └── path-exists@4.0.0 deduped
│ │ │ │ ├── get-package-type@0.1.0
│ │ │ │ ├─┬ js-yaml@3.14.1
│ │ │ │ │ ├─┬ argparse@1.0.10
│ │ │ │ │ │ └── sprintf-js@1.0.3
│ │ │ │ │ └── esprima@4.0.1
│ │ │ │ └── resolve-from@5.0.0
│ │ │ ├── @istanbuljs/schema@0.1.3
│ │ │ ├─┬ istanbul-lib-instrument@5.2.1
│ │ │ │ ├── @babel/core@7.23.3 deduped
│ │ │ │ ├── @babel/parser@7.23.4 deduped
│ │ │ │ ├── @istanbuljs/schema@0.1.3 deduped
│ │ │ │ ├── istanbul-lib-coverage@3.2.2 deduped
│ │ │ │ └── semver@6.3.1
│ │ │ └─┬ test-exclude@6.0.0
│ │ │ ├── @istanbuljs/schema@0.1.3 deduped
│ │ │ ├── glob@7.2.3 deduped
│ │ │ └── minimatch@3.1.2 deduped
│ │ ├─┬ babel-preset-jest@29.6.3
│ │ │ ├── @babel/core@7.23.3 deduped
│ │ │ ├─┬ babel-plugin-jest-hoist@29.6.3
│ │ │ │ ├── @babel/template@7.22.15 deduped
│ │ │ │ ├── @babel/types@7.23.4 deduped
│ │ │ │ ├── @types/babel__core@7.20.5 deduped
│ │ │ │ └── @types/babel__traverse@7.20.4 deduped
│ │ │ └── babel-preset-current-node-syntax@1.0.1 deduped
│ │ ├─┬ chalk@4.1.2
│ │ │ ├─┬ ansi-styles@4.3.0
│ │ │ │ └─┬ color-convert@2.0.1
│ │ │ │ └── color-name@1.1.4
│ │ │ └─┬ supports-color@7.2.0
│ │ │ └── has-flag@4.0.0
│ │ ├── graceful-fs@4.2.11 deduped
│ │ └── slash@3.0.0
│ ├─┬ bs-logger@0.2.6
│ │ └── fast-json-stable-stringify@2.1.0 deduped
│ ├── fast-json-stable-stringify@2.1.0
│ ├─┬ jest-util@29.7.0
│ │ ├── @jest/types@29.6.3 deduped
│ │ ├── @types/node@20.10.0 deduped
│ │ ├─┬ chalk@4.1.2
│ │ │ ├─┬ ansi-styles@4.3.0
│ │ │ │ └─┬ color-convert@2.0.1
│ │ │ │ └── color-name@1.1.4
│ │ │ └─┬ supports-color@7.2.0
│ │ │ └── has-flag@4.0.0
│ │ ├── ci-info@3.9.0 deduped
│ │ ├── graceful-fs@4.2.11 deduped
│ │ └── picomatch@2.3.1
│ ├── jest@29.7.0 deduped
│ ├── json5@2.2.3
│ ├── lodash.memoize@4.1.2
│ ├── make-error@1.3.6
│ ├── semver@7.5.4 deduped
│ ├── typescript@5.3.2 deduped
│ └── yargs-parser@21.1.1
├─┬ ts-node@10.9.1
│ ├─┬ @cspotcode/source-map-support@0.8.1
│ │ └─┬ @jridgewell/trace-mapping@0.3.9
│ │ ├── @jridgewell/resolve-uri@3.1.1
│ │ └── @jridgewell/sourcemap-codec@1.4.15
│ ├── UNMET OPTIONAL DEPENDENCY @swc/core@>=1.2.50
│ ├── UNMET OPTIONAL DEPENDENCY @swc/wasm@>=1.2.50
│ ├── @tsconfig/node10@1.0.9
│ ├── @tsconfig/node12@1.0.11
│ ├── @tsconfig/node14@1.0.3
│ ├── @tsconfig/node16@1.0.4
│ ├── @types/node@20.10.0 deduped
│ ├── acorn-walk@8.3.0
│ ├── acorn@8.11.2
│ ├── arg@4.1.3
│ ├── create-require@1.1.1
│ ├── diff@4.0.2
│ ├── make-error@1.3.6 deduped
│ ├── typescript@5.3.2 deduped
│ ├── v8-compile-cache-lib@3.0.1
│ └── yn@3.1.1
├── typescript@5.3.2
└─┬ winston@3.11.0
├── @colors/colors@1.6.0
├─┬ @dabh/diagnostics@2.0.3
│ ├─┬ colorspace@1.1.4
│ │ ├─┬ color@3.2.1
│ │ │ ├─┬ color-convert@1.9.3
│ │ │ │ └── color-name@1.1.3
│ │ │ └─┬ color-string@1.9.1
│ │ │ ├── color-name@1.1.3 deduped
│ │ │ └─┬ simple-swizzle@0.2.2
│ │ │ └── is-arrayish@0.3.2
│ │ └── text-hex@1.0.0
│ ├── enabled@2.0.0
│ └── kuler@2.0.0
├── async@3.2.5 deduped
├── is-stream@2.0.1
├─┬ logform@2.6.0
│ ├── @colors/colors@1.6.0
│ ├── @types/triple-beam@1.3.5
│ ├── fecha@4.2.3
│ ├── ms@2.1.2 deduped
│ ├── safe-stable-stringify@2.4.3 deduped
│ └── triple-beam@1.4.1 deduped
├─┬ one-time@1.0.0
│ └── fn.name@1.1.0
├─┬ readable-stream@3.6.2
│ ├── inherits@2.0.4 deduped
│ ├─┬ string_decoder@1.3.0
│ │ └── safe-buffer@5.2.1
│ └── util-deprecate@1.0.2
├── safe-stable-stringify@2.4.3
├── stack-trace@0.0.10
├── triple-beam@1.4.1
└─┬ winston-transport@4.6.0
├── logform@2.6.0 deduped
├── readable-stream@3.6.2 deduped
└── triple-beam@1.4.1 deduped
