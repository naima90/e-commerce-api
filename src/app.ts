import * as dotevnv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { userRouter } from "./users/user.routes";

dotevnv.config();

if (!process.env.PORT) {
  console.error("No port value is specified.. ");
}

const PORT = parseInt(process.env.PORT as string, 10);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

app.use("/", userRouter);

// listen for a port
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
