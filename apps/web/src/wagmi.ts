import { filecoin, filecoinCalibration } from 'viem/chains';
import { http, createConfig } from '@wagmi/core';

const config = createConfig({
  chains: [filecoinCalibration, filecoin],
  connectors: [],
  transports: {
    [filecoin.id]: http(),
    [filecoinCalibration.id]: http(),
  },
});

export function getWagmiConfig() {
  return config;
}
