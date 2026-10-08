# App registry

`apps.json` is the generated public registry consumed by the website. Its
entries follow the contract in [`../schema/v1/apps.cue`](../schema/v1/apps.cue).

`apps.cue` is the trusted-source allowlist. A release may update an entry only
when its repository is listed there.

Upstream app repositories should provide a `.registry.yml` file and call the
reusable workflow in [`.github/workflows/publish.yml`](../.github/workflows/publish.yml).
