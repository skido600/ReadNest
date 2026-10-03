import { cloudinary } from "../configs/cloudinary.ts";

export class uploadTocloudinary {
  public static async uploadBook(filePath: any) {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "books",
      resource_type: "raw",
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }
  public static async uploadCoverBook(filePath: any) {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "cover",
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }
  public static async deleteFile(publicId: string) {
    if (!publicId) return;

    await cloudinary.uploader
      .destroy(publicId, {
        resource_type: "raw",
      })
      .catch(async () => {
        // fallback for images
        await cloudinary.uploader.destroy(publicId);
      });
  }
}
