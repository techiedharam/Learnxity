require('dotenv').config();
import { app } from "./app";
import connectDB from "./config/db";

const port = process.env.PORT || 5000;

app.listen(port, async () => {
  await connectDB()
  console.log(`Learnxity webApp Server is running on http://localhost:${port}`);
});
