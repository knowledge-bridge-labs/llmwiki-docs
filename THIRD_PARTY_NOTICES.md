# Third-Party Notices

This documentation site is built with VitePress. The repository source is
licensed under Apache-2.0. The public Pages artifact also includes VitePress
client assets and default-theme font files; see
[docs/legal-notices.md](docs/legal-notices.md) for the site-visible notice.
Full upstream license, copyright, notice, and attribution text retained from
installed site dependency packages is generated into
[`docs/public/third-party-licenses.txt`](docs/public/third-party-licenses.txt).

## Direct Documentation Dependency

| Package | Version range | License | Homepage |
| --- | --- | --- | --- |
| `vitepress` | `^1.6.4` | MIT | <https://vitepress.dev/> |

Transitive dependencies are tracked in `package-lock.json`. Keep the generated
license page current with:

```sh
npm run licenses:generate
npm run licenses:check
```
