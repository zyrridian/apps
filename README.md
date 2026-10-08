# App registry

This repository hosts the static app catalogue and the generated public
registry at [`registry/apps.json`](registry/apps.json).

## Contract

The normalized `v1` app shape is defined in
[`schema/v1/apps.cue`](schema/v1/apps.cue). The trusted upstream repositories
and their editorial settings are listed in [`registry/apps.cue`](registry/apps.cue).

## Upstream releases

An app repository should copy [`.registry.yml.example`](.registry.yml.example)
to `.registry.yml`, adjust its artifact paths, and use its existing release
workflow to check out this repository with `STORE_PAT`. After copying the
artifact, icon, screenshots, and `manifest.json`, run:

```bash
REGISTRY_GENERATED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  node scripts/generate-registry.mjs
```

The generator recalculates SHA-256 and size from the copied artifact. Commit
`apps/<id>/manifest.json`, the release files, and `registry/apps.json` together.
The [`validate.yml`](.github/workflows/validate.yml) workflow then verifies the
registry on every bot push.
