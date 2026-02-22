// We don't have crypto-js installed. Use Web Crypto API.

const API_KEY = process.env.VITE_CLOUDINARY_API_KEY;
const API_SECRET = process.env.VITE_CLOUDINARY_API_SECRET;
const CLOUD_NAME = process.env.VITE_CLOUDINARY_CLOUD_NAME;

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
    // upload_preset: 'ml_default', // Optional for signed uploads if using API Key/Secret directly? 
    // Actually, signed uploads don't need a preset if you sign correctly, but usually you need one or use default.
    // Let's try without preset first, or use 'unsigned' if that fails.
    // Wait, signed uploads use the API Key and Secret to authenticate, so no preset needed usually unless for transformation.
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
