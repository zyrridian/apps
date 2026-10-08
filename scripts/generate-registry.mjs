import { createHash } from 'node:crypto';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]):/, '$1:');
const appsRoot = join(root, 'apps');
const registryPath = join(root, 'registry', 'apps.json');

async function readJson(path) {
    return JSON.parse(await readFile(path, 'utf8'));
}

async function hashFile(path) {
    const contents = await readFile(path);
    return {
        sha256: createHash('sha256').update(contents).digest('hex'),
        size: contents.length
    };
}

async function buildApp(id) {
    const appRoot = join(appsRoot, id);
    const manifest = await readJson(join(appRoot, 'manifest.json'));
    const artifact = manifest.artifacts?.[0];

    if (!artifact) {
        throw new Error(`${id}/manifest.json must contain at least one artifact`);
    }

    const artifactPath = join(appRoot, artifact.filename);
    const metadata = await hashFile(artifactPath);
    const screenshots = (manifest.screenshots ?? []).map(filename => ({
        filename,
        url: `./apps/${id}/screenshots/${filename}`
    }));
    const result = {
        ...manifest,
        artifacts: [{
            ...artifact,
            url: `./apps/${id}/${artifact.filename}`,
            ...metadata
        }],
        screenshots
    };

    if (manifest.icon) {
        result.icon = `./apps/${id}/${manifest.icon}`;
    }

    return result;
}

const ids = (await readdir(appsRoot, { withFileTypes: true }))
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();
const existing = await readJson(registryPath);
const apps = await Promise.all(ids.map(buildApp));
const registry = {
    schema: 'v1',
    generatedAt: process.env.REGISTRY_GENERATED_AT ?? existing.generatedAt ?? new Date().toISOString(),
    apps
};

await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
console.log(`Generated ${relative(root, registryPath)} for ${apps.length} apps`);
