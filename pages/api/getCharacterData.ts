// Just get Enka data
import { NextApiRequest, NextApiResponse } from 'next';
import { EnkaManager, Client } from 'genshin-manager';
import fs from 'fs';

let client: Client | null = null;

const getClient = async () => {
  if (!client) {
    const tempDir = '/tmp/genshin-manager-cache';
    // Ensure the directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
      console.log('Temp directory created:', tempDir); // Does it persist for this serverless function
    }

    client = new Client({
      assetCacheFolderPath: '/tmp/genshin-manager-cache',
      downloadLanguages: ['EN'],
      autoFetchLatestAssetsByCron: '10 15 * * 4', // Every Wednesday at midnight
      fetchOption: {
        headers: {
          'User-Agent': 'genshin-artifact-appraiser.vercel.app',
        }
      },
    });
    console.time('ClientUpdate');
    await client.deploy();
    console.timeEnd('ClientUpdate');
  }
  return client;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const uid = req.body.uid;
    try {
      await getClient();
      const enkaManager = new EnkaManager();
      const allData = (await enkaManager.fetchAll(
        uid,
        {
          headers:
            { 'User-Agent': 'genshin-artifact-appraiser.vercel.app' + uid, }
        }
      ));
      const retData = allData.characterDetails;
      //const ttl = allData.nextShowCaseDate;
      //const ownerHash = allData.owner?.data.hash; // Can use to pull all saved Enka builds

      res.status(200).json(retData);
    } catch (error) {
      console.error('Error fetching character data:', error); // Log the error
      res.status(500).json({ error: 'Failed to fetch character data' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}