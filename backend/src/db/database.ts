import mongoose, { ConnectOptions } from "mongoose";

const connectDatabase = () => {
  mongoose
    .connect(process.env.DB_URL!, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions)
    .then((data) => {
      console.log(`MongoDB connected with server: ${data.connection.host}`);
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB:", error.message);
    });
};

export default connectDatabase;