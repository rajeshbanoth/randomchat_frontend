import httpProxy from "http-proxy";

const proxy = httpProxy.createProxyServer();

export default function handler(req, res) {
  proxy.web(req, res, {
    target: "http://13.60.191.64:5000",
    ws: true,
    changeOrigin: true,
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
