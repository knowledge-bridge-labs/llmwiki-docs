# Third-Party Licenses

The full generated third-party license text artifact is published as a static
file:

[third-party-licenses.txt](/third-party-licenses.txt)

It is generated from `package-lock.json` and the installed npm package
directories:

```sh
npm run licenses:generate
npm run licenses:check
```

Keeping the full text as a static artifact avoids bundling a large generated
license page into the VitePress client route while still retaining the notices
with the public Pages output.
