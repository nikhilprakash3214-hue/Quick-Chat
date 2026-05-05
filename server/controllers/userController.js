import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

// --- Sign up new user ---
export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body;

    try {
        if (!fullName || !email || !password || !bio) {
            return res.json({ success: false, message: "All fields are required" });
        }
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.json({ success: false, message: "Account already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName, email, password: hashedPassword,bio
        });

        const token = generateToken(newUser._id);

        res.json({success:true , userData : newUser,token,message:"Account created successfully" })
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message});
    }
};

// --- Login user ---
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({email})

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);

        if (!isPasswordCorrect) {
            return res.json({ success: false, message: "Invalid credentials" });
        }
        const token = generateToken(userData._id);
        res.json({ success: true, userData, token, message: "Login successfull" })
    } catch (error) {
        console.error("Login Error:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// --- Check Authentication ---


export const checkAuth = (req, res) => {
    res.json({ success: true, user: req.user });
};

// --- Update User Profile ---
export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body;

        const userId = req.user._id;
        let updatedUser;

        if (!profilePic){
            updatedUser =await User.findByIdAndUpdate(userId, {bio, fullName},
        {new: true});
            } else {
                const upload = await cloudinary.uploader.upload(profilePic);

                updatedUser = await User.findByIdAndUpdate(userId, {profilePic:upload.secure_url, bio,fullName},
                {new: true});
    }
        res.json({ success: true, user: updatedUser });
 
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
};
// --- Logout User ---
// export const logout = async (req, res) => {
//     try {
//         // Clear the cookie (if you are using cookie-based auth)
//         res.cookie("jwt", "", { maxAge: 0 });
//         res.status(200).json({ success: true, message: "Logged out successfully" });
//     } catch (error) {
//         console.error("Logout Error:", error.message);
//         res.status(500).json({ success: false, message: "Internal server error" });
//     }
// };