import { UserData } from "./interfaces";

export const fetchEnkaData = async (uid: string): Promise<UserData> => {
  try {
    const response = await fetch(`/api/fetchData?uid=${uid}`);
    const data = await response.json();
    return data as UserData;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};
