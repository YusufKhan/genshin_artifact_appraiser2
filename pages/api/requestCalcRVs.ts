import { NextApiRequest, NextApiResponse } from 'next';
import calculateRVs from './calculateRVs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {

    const characterData = req.body.characterData;
    const weights = req.body.weights;
    console.log("Called request Calc RVs");

    const rollValueData = calculateRVs(characterData, weights) //Maybe make interface for name+artifacts only dataType
    res.status(200).json(rollValueData);
  }
}