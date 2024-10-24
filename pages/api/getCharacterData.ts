import { NextApiRequest, NextApiResponse } from "next";
import { EnkaManager, Client } from "genshin-manager";
import fs from "fs";
import path from "path";

let client: Client | null = null;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const uid = req.body.uid;

    try {
      await getClient();
      const enkaManager = new EnkaManager();

      const allData = await enkaManager.fetchAll(uid, {
        headers: {
          "User-Agent": "genshin-artifact-appraiser.vercel.app" + uid,
        },
      });

      const characterData = allData.characterDetails;
      //const ttl = allData.nextShowCaseDate;
      //const ownerHash = allData.owner?.data.hash; // Can use to pull all saved Enka builds
      res.status(200).json(characterData);
    } catch (error) {
      console.error("Error fetching character data:", error); // Log the error
      res.status(500).json({ error: "Failed to fetch character data" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

const getClient = async () => {
  if (!client) {
    const tempDir = "/tmp/cache";
    // Ensure the directory exists
    /* if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
      console.log("Temp directory created:", tempDir); // Does it persist for this serverless function
    } */

    const sourceFolder = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "..",
      "node_modules",
      "genshin-manager",
      "cache"
    );
    const targetFolder = "/tmp/";

    console.time("Copying cache folder to temp");
    copyFolderRecursiveSync(sourceFolder, targetFolder);
    console.timeEnd("Copying cache folder to temp");

    client = new Client({
      assetCacheFolderPath: tempDir,
      downloadLanguages: ["EN"],
      showFetchCacheLog: true,
      autoFetchLatestAssetsByCron: "0 0 * * 3", // Every Wednesday at midnight
      fetchOption: {
        headers: {
          "User-Agent": "genshin-artifact-appraiser.vercel.app",
        },
      },
    });

    console.time("ClientUpdate");
    await client.deploy();
    console.timeEnd("ClientUpdate");
  }
  return client;
};

const copyFolderRecursiveSync = (source: string, target: string) => {
  const targetFolder = path.join(target, path.basename(source));
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
  }

  if (fs.lstatSync(source).isDirectory()) {
    fs.readdirSync(source).forEach((file) => {
      const curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder);
      } else {
        fs.copyFileSync(curSource, path.join(targetFolder, file));
      }
    });
  }
};
