import axios from "axios";
import https from "https";

const agent = new https.Agent({ rejectUnauthorized: false });

const VitolClient = axios.create({
    baseURL: "https://vitolcc.vit.ac.in/",
    httpsAgent: agent,
    withCredentials: true,
});

const VitolClient2 = axios.create({
    baseURL: "https://vitolcc1.vit.ac.in/",
    httpsAgent: agent,
    withCredentials: true,
});

export default function getVitolClient(site: string) {
    if (site === "vitolcc1") {
        return VitolClient2;
    }
    return VitolClient;
}