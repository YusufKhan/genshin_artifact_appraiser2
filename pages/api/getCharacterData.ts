// Just get Enka data
import { NextApiRequest, NextApiResponse } from 'next';
import { EnkaManager } from 'genshin-manager';
import { getClient } from '../../utils/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {

    const uid = req.body.uid;
    console.log("Obtained from body");
    console.log(uid);

    try {
      await getClient();
      const enkaManager = new EnkaManager();
      const allData = (await enkaManager.fetchAll(uid)).characterDetails;

      res.status(200).json(allData);
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