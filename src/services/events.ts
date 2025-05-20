import mitt, { Emitter } from "mitt";

export type ConnectWalletEvent = {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
};

export type Events = {
  connectWallet: ConnectWalletEvent;
};

const events: Emitter<Events> = mitt();

export default events;
