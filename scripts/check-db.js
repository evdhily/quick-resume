import "dotenv/config";
import { closeDatabase, getDatabaseInfo, initDatabase } from "../database.js";

try {
  await initDatabase();
  console.log("Database connection OK");
  console.log(getDatabaseInfo());
} catch (error) {
  console.error("Database connection failed");
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
