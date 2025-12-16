import axios from "axios";
import https from "https";

const agent = new https.Agent({ rejectUnauthorized: false });

const LMSClient = axios.create({
    baseURL: "https://lms.vit.ac.in",
    httpsAgent: agent,
    withCredentials: true,
});

export default LMSClient;