import Node from "./node.ts";
import Network from "../network.ts";
import NetInterface from "./interface.ts";
import EthFrame from "../protocols/ethernet.ts";
import { toHexString } from "../utils.ts";

type MacAddrTable = {
  [key: string]: NetInterface;
};

export default class Switch extends Node {
  macAddrTable: MacAddrTable = {};
  constructor(
    name: string,
    network: Network,
    netInterfaces = ["eth0", "eth1", "eth2", "eth3"]
  ) {
    super(name, network);
    netInterfaces.forEach((name) => {
      this.addInterface(new NetInterface(name, this));
    });
    this.type = "switch";
  }
  receive(message: EthFrame, netInterface: NetInterface) {
    this.network.log(
      `${this.name} -> received from ${netInterface.name}: <br /> ${toHexString(
        message.raw(),
        " "
      )}`
    );
    const desAddr = message.destinationAddress;
    if (this.macAddrTable[toHexString(desAddr)]) {
      this.send(message, this.macAddrTable[toHexString(desAddr)]);
    }
    if (toHexString(desAddr) === "ffffffffffff") {
      Object.values(this.interfaces).forEach((int) => {
        if (int.mac !== netInterface.connectedTo?.mac) {
          this.send(message, int);
        }
      });
    }
  }
}
