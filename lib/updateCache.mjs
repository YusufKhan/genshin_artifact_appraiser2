// Pre build event
// Disabled in package.json removed:
// "prebuild": "node .//lib/updateCache.mjs",

import { Client } from 'genshin-manager';
// autoFetchLatestAssetsByCron is "0 0 0 * * 3" by default
// By default, it runs every Wednesday at 00:00:00
// downloadLanguages is All TextMap by default
console.log("Prebuild: updateCache");
const client = new Client({
    downloadLanguages: ['EN'],
    //assetCacheFolderPath: '/tmp/genshin-manager-cache'
})
await client.deploy()
process.exit(0);