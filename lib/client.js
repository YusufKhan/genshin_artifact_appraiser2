// lib/client.js
import { Client } from 'genshin-manager';

let client = null;

export async function getClient() {
    if (!client) {
        client = new Client({
            downloadLanguages: ['EN'],
            autoFetchLatestAssetsByCron: '0 0 0 * * 3', // Every Wednesday at midnight
        });
        console.time('ClientUpdate');
        await client.deploy();
        console.timeEnd('ClientUpdate');
    }
    return client;
}