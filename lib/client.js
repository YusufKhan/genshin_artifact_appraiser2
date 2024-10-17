// lib/client.js
import { Client } from 'genshin-manager';
import fs from 'fs';

let client = null;

export async function getClient() {
    if (!client) {
        const tempDir = '/tmp/genshin-manager-cache';
        // Ensure the directory exists
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }


        client = new Client({
            assetCacheFolderPath: '/tmp/genshin-manager-cache',
            downloadLanguages: ['EN'],
            autoFetchLatestAssetsByCron: '0 22 0 * * 4', // Every Wednesday at midnight
        });
        console.time('ClientUpdate');
        await client.deploy();
        console.timeEnd('ClientUpdate');
    }
    return client;
}