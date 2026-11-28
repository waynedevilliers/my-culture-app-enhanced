import { Image } from "../db.js";

export const imageCheck = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({
            message: "Please select an image to upload."
        });
    }

    const name = req.file.originalname;
    
    try {
        const existingImage = await Image.findOne({ where: { name } });

        if (existingImage) {
            return res.status(400).json({
                message: "An image with this name already exists. Please choose a different name."
            });
        }
        next();
    } catch (err) {
        return res.status(500).json({
            message: "Error checking the database."
        });
    }
};