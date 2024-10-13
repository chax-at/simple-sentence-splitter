## Types-Only Packages

Sometimes you want to provide only types with your package.
In `tsconfig.json` you can add
```json
{
  "compilerOptions": {
    "emitDeclarationOnly": true,
  }
}
```

to prevent bundling any JS. Instead, the `/lib` folder will then only contain the emitted `*.d.ts` files.

In the `package.json` you can safely remove the `main` property.
