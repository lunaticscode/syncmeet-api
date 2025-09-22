import mongoose from "mongoose";
import { MONGODB_DB_NAME, MONGODB_URL } from "../consts/db";
import { AppError } from "../utils/error";

const ALREADY_CONNECTED = 1;
const CONNECTING = 2;
export const dbConnect = () => {
  if (
    [ALREADY_CONNECTED, CONNECTING].includes(mongoose.connection.readyState)
  ) {
    return mongoose;
  }

  const connection = mongoose.connect(MONGODB_URL, { dbName: MONGODB_DB_NAME });
  mongoose.connection.on("connected", () => {
    console.log(`✅[mongo] connected '${MONGODB_DB_NAME}'`);
  });

  mongoose.connection.on("error", (_err) => {
    throw new AppError(
      `Occured error from connecting MongoDB`,
      "FAIL_TO_CONNECT_DB"
    );
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("💤[mongo] disconnected");
  });

  return connection;
};

export default mongoose;
