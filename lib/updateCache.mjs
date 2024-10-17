import { Client } from 'genshin-manager';
// autoFetchLatestAssetsByCron is "0 0 0 * * 3" by default
// By default, it runs every Wednesday at 00:00:00
// downloadLanguages is All TextMap by default
const client = new Client({
    downloadLanguages: ['EN'],
    assetCacheFolderPath: '/tmp/genshin-manager-cache'
})
console.time('ClientUpdate');
await client.deploy()
console.timeEnd('ClientUpdate');
process.exit(0);