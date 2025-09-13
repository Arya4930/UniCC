import axios from "axios";
import https from "https";

const agent = new https.Agent({ rejectUnauthorized: false });

export const client = axios.create({
  baseURL: "https://vtopcc.vit.ac.in",
  headers: {
    "User-Agent": "Mozilla/5.0 ...",
    Accept: "text/html,application/xhtml+xml",
  },
  httpsAgent: agent,
  withCredentials: true,
});
