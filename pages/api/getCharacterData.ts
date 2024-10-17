import { NextApiRequest, NextApiResponse } from 'next';
import { EnkaManager } from 'genshin-manager';
import { getClient } from '../../lib/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {

    /* const client = new Client({
      downloadLanguages: ['EN'],
      autoFetchLatestAssetsByCron: '0 0 0 * * 3',
    })
    console.time('ClientUpdate');
    await client.deploy()
    console.timeEnd('ClientUpdate'); */

    const uid = req.body.uid;
    console.log(uid);

    try {
      await getClient();
      const enkaManager = new EnkaManager();
      const data = (await enkaManager.fetchAll(uid)).characterDetails;
      res.status(200).json(data);
    }
    catch (enkaError: unknown) {
      if (enkaError instanceof Error) {
        res.status(500).json({ message: 'Fetch data failed', enkaError });
      } else {
        console.log("Unknown error: ", enkaError);
      }

      res.status(405).json({ message: 'Method not allowed' });
    }
  }
}