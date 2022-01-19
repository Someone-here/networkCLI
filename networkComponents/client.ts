import Node from "./node.ts";
import Network from "../network.ts";
import NetInterface from "./interface.ts";
import { toHexString } from "../utils.ts";
import EthFrame from "../protocols/ethernet.ts";

export default class Client extends Node {
  constructor(name: string, network: Network, netInterfaces = ["eth0"]) {
    super(name, network);
    netInterfaces.forEach((name) => {
      this.addInterface(new NetInterface(name, this));
    });
    this.type = "client";
  }

  receive(message: EthFrame, netInterface: NetInterface) {
    this.network.log(
      `${this.name} -> received from ${netInterface.name}: <br /> ${toHexString(
        message.raw(),
        " "
      )}`
    );
  }
}
