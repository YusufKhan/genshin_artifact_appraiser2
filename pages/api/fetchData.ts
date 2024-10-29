import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const uid = req.query.uid;
    //console.log(`https://enka.network/api/uid/${uid}`);
    const response = await fetch(`https://enka.network/api/uid/${uid}`, {
      headers: {
        "User-Agent": "genshin_artifact_appraiser_${uid}",
        "Content-Type": "application/json",
      },
    });
    //console.log(response);
    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw new Error("Invalid UID format. Please check your UID.");
        case 404:
          throw new Error("Player does not exist. Please verify the UID.");
        case 424:
          throw new Error("Game maintenance in progress. Try again later.");
        case 429:
          throw new Error("Rate-limited. Please try again after some time.");
        case 500:
          throw new Error("Server error. Please try again later.");
        case 503:
          throw new Error("Service unavailable. Please check back later.");
        default:
          throw new Error(`Unexpected error: ${response.statusText}`);
      }
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error });
  }
}
