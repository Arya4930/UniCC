import axios from "axios";
import https from "https";

const agent = new https.Agent({ rejectUnauthorized: false });

export const ChennaiClient = axios.create({
  baseURL: "https://vtopcc.vit.ac.in",
  headers: {
    "User-Agent": "Mozilla/5.0 ...",
    Accept: "text/html,application/xhtml+xml",
  },
  httpsAgent: agent,
  withCredentials: true,
});

export const VelloreClient = axios.create({
  baseURL: "https://vtop.vit.ac.in",
  headers: {
    "User-Agent": "Mozilla/5.0 ...",
    Accept: "text/html,application/xhtml+xml",
  },
  httpsAgent: agent,
  withCredentials: true,
});