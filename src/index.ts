import type {
  Plugin,
  PluginAPI,
  RPCRequest,
  RPCResponse,
} from "@lumeweb/relay";
import { ethers } from "ethers";

const providers = new Map<string, ethers.providers.JsonRpcProvider>();

function getProvider(
  config: any,
  chainId: string
): ethers.providers.JsonRpcProvider {
  if (providers.has(chainId)) {
    return providers.get(chainId) as ethers.providers.JsonRpcProvider;
  }

  const provider = new ethers.providers.JsonRpcProvider({
    url: `https://${chainId}.gateway.pokt.network/v1/lb/${config.str(
      "pocket-app-id"
    )}`,
    password: config.str("pocket-app-key"),
  });
  providers.set(chainId, provider);

  return provider;
}

const plugin: Plugin = {
  name: "evm",
  async plugin(api: PluginAPI): Promise<void> {
    let blockchainRpcPlugin = await api.loadPlugin("blockchain-rpc");

    ["eth_call", "eth_chainId", "net_version"].forEach((method) => {
      api.registerMethod(method, {
        cacheable: true,
        async handler(request: RPCRequest): Promise<RPCResponse | null> {
          const chain = request.data.length ? request.data.shift() : "";
          const resp = await blockchainRpcPlugin.exports.proxyRpcMethod(
            api.config,
            request,
            chain,
            (chainId: string) => {
              const provider = getProvider(api.config, chainId);
              return provider.send.bind(provider);
            }
          );

          return { data: resp };
        },
      });
    });
  },
};

export default plugin;
