import { Client } from 'genshin-manager';

export default function handler(req, res) {
    // Your cron job logic here

    // autoFetchLatestAssetsByCron is "0 0 0 * * 3" by default
    // By default, it runs every Wednesday at 00:00:00
    // downloadLanguages is All TextMap by default
    const client = new Client({
        downloadLanguages: ['EN'],
        assetCacheFolderPath: '/tmp/genshin-manager-cache'
    })
    console.time('ClientUpdate');
    client.deploy()
    console.timeEnd('ClientUpdate');
    res.status(200).json({ message: 'Cron job executed successfully' });
    process.exit(0);
}
