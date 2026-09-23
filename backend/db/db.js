import mongoose from "mongoose";

const connectdb = async () => {
    try {
        await mongoose.connect(
            "mongodb+srv://topclasscomedy59_db_user:cNPD06uMTjApE4ku@cluster0.uh7wdqh.mongodb.net/"
        );

        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
};

export default connectdb;