// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true, minLength: 6 },
        fullName: { type: String, required: true },
        bio: { type: String, default: "Hey there! I am using QuickChat." },
        profilePic: {
            type: String,
            // Provide a real default URL (Mongoose cannot access your React 'assets')
            default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;