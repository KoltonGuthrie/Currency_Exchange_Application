import app from "./server.js";
import "dotenv/config";

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 8080;

app.listen(PORT, HOST, () => {
	console.log(`Server is running on http://${HOST}:${PORT}`);
});
