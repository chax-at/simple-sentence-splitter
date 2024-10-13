# Bin

Sometimes you want to provide command line tools to the project using your package.

1. Add your script to the `bin` folder (e.g. JS-files to run in Node), or compile them into it.
    * Put the Shebang into the first line, to help unix systems run them. E.g. `#!/usr/bin/env node` for Node scripts
    * On a unix system make the file executable.
1. Add the script path to the `bin` section of the `package.json`, e.g.
    ```json
    {
      "bin": {
        "my-package-hello-roger": "./bin/hello-roger.js" // with a prefix you can avoid naming collisions
      }
    }
    ```
1. Once installed you can then run the script with
    ```bash
    npx my-package-hello-roger
    ```
    And add them to the dependent package's `package.json`.