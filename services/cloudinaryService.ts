

const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.COUDINARY_API_SECRET;
const CLOUD_NAME =  process.env.COUDINARY_CLOUD_NAME; 

async function generateSignature(params: Record<string, string | number>, secret: string): Promise<string> {
  const sortedKeys = Object.keys(params).sort();
  const stringToSign = sortedKeys.map(key => `${key}=${params[key]}`).join('&') + secret;
  
  const msgBuffer = new TextEncoder().encode(stringToSign);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export const uploadToCloudinary = async (file: File): Promise<string> => {
  if (CLOUD_NAME === 'YOUR_CLOUD_NAME') {
    console.error("Cloudinary Cloud Name is not set. Please update services/cloudinaryService.ts");
    alert("Please set your Cloudinary Cloud Name in services/cloudinaryService.ts");
    throw new Error("Cloud Name not set");
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const params = {
    timestamp: timestamp,
  };

  const signature = await generateSignature(params, API_SECRET);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', API_KEY);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};
