import { database, storage } from "@/app/firebase/config";
import { push, ref, get, set, Database } from "firebase/database";
import { ControlData } from "../type";
import { getStorage, getDownloadURL, FirebaseStorage, ref as storageRef } from "firebase/storage";


export const getData = async () => {
  try {
    const headerRef = ref(database, 'sensor_data');
    const snapshot = (await get(headerRef));
    return snapshot.val()

  } catch (error) {
    console.error("Error getting data:", error);
    throw error;
  }
};

export const getControl = async () => {
  try {
    const headerRef = ref(database, 'sensor_data/control');
    const snapshot = (await get(headerRef));
    return snapshot.val()

  } catch (error) {
    console.error("Error getting data:", error);
    throw error;
  }
};

export const writeControl = async (data: ControlData) => {
  const headerRef = ref(database, 'sensor_data/control');
  await set(headerRef, data);
};


export async function getImageData(imagePath: string): Promise<string> {
  try {
    // Create a reference to the file we want to download
    // const storage = getStorage();
    const imageRef = storageRef(storage, imagePath);

    // Get the download URL
    const url: string = await getDownloadURL(imageRef);
    return url;
  } catch (error: any) {
    // Handle the error accordingly
    switch (error.code) {
      case 'storage/object-not-found':
        // File doesn't exist
        throw new Error('File does not exist');
      case 'storage/unauthorized':
        // User doesn't have permission to access the object
        throw new Error('Unauthorized access');
      case 'storage/canceled':
        // User canceled the upload
        throw new Error('Upload canceled');
      case 'storage/unknown':
        // Unknown error occurred, inspect the server response
        throw new Error('Unknown error occurred');
      default:
        throw new Error('An error occurred');
    }
  }
}