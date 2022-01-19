import { toHexString } from "../utils.ts";
import Network from "../network.ts";
import NetInterface from "./interface.ts";
import EthFrame from "../protocols/ethernet.ts";
import { EventEmitter } from "https://deno.land/x/event_emitter/mod.ts";

type NetInterfaces = {
  [key: string]: NetInterface;
};
interface Events {
  connect: (from: NetInterface, to: NetInterface) => void;
  disconnect: (from: NetInterface, to: NetInterface) => void;
}

export default class Node extends EventEmitter<Events> {
  type = "node";
  constructor(
    public name: string,
    public network: Network,
    public interfaces: NetInterfaces = {}
  ) {
    super();
    this.network.add(this);
  }

  addInterface(netInterface: NetInterface): void {
    this.interfaces[netInterface.name] = netInterface;
  }

  send(message: EthFrame, netinterface: NetInterface) {
    this.network.log(
      `${this.name} -> sent(at int:${netinterface.name}): <br /> ${toHexString(
        message.raw(),
        " "
      )}`
    );
    netinterface.send(message);
  }

  receive(message: EthFrame, netinterface: NetInterface) {
    this.network.log(
      `${this.name} -> received from ${netinterface.name}: <br /> ${toHexString(
        message.raw(),
        " "
      )}`
    );
  }

  rename(name: string): void {
    if (name === this.name) return;
    if (this.network.nodes[name]) throw new Error("Node already exists");
    if (name.length < 3) throw new Error("Name must be more than 3 letters");
    this.network.nodes[name] = this;
    delete this.network.nodes[this.name];
    this.name = name;
    this.network.log(`Changed name to: ${this.name}`);
  }
}
