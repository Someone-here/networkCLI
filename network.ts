import { toHexString } from "./utils.ts";
import Node from "./networkComponents/node.ts";
import NetInterface from "./networkComponents/interface.ts";

type Nodes = {
  [key: string]: Node;
};

export default class Network {
  public macs: string[] = [];
  public nodes: Nodes = {};
  public logs: string[] = [];
  constructor() {}

  /** Add a node to the network */
  add(node: Node): void {
    if (this.nodes[node.name]) {
      this.log(`${node.name} already exist and cannot be added`);
      return;
    }
    this.nodes[node.name] = node;
    Object.values(node.interfaces).forEach((netInterface) => {
      this.macs.push(toHexString(netInterface.mac, ":"));
    });
    this.log(`New ${node.type} - ${node.name} added.`);
  }

  /** Connect two interfaces with each other */
  connect(netInt1: NetInterface, netInt2: NetInterface): void {
    if (netInt1.node === netInt2.node) {
      this.log(`cannot connect two interfaces from the same node`);
      return;
    }
    if (netInt1.connectedTo?.node === netInt2.node) {
      this.log(
        `${netInt1.node.name} is already connected to ${netInt2.node.name}`
      );
      return;
    } else {
      netInt1.connect(netInt2);
      this.log(
        `${netInt1.node.name}(${toHexString(netInt1.mac, ":")}) and ${
          netInt2.node.name
        }(${toHexString(netInt2.mac, ":")}) are connected`
      );
    }
  }

  /** Disconnect two interfaces with each other */
  disconnect(netInt: NetInterface): void {
    if (!netInt.connectedTo) {
      this.log(`${netInt.name} is not connected to anything...`);
      return;
    } else {
      this.log(
        `Disconnected ${netInt.node.name}(${netInt.name}) from ${netInt.connectedTo.node.name}(${netInt.connectedTo.name})`
      );
      netInt.disconnect();
    }
  }

  log(memo: string): void {
    console.log(memo);
    this.logs.push(`${new Date().toLocaleString("en-US")} | ${memo}`);
  }

  delete(node: Node): void {
    if (!this.nodes[node.name]) {
      this.log(`${node.name} doesn't already exist and cannot be deleted.`);
      return;
    }
    delete this.nodes[node.name];
    const ndMacs = Object.values(node.interfaces).map((netInterface) =>
      toHexString(netInterface.mac, ":")
    );
    this.macs = this.macs.filter((mac) => ndMacs.includes(mac));
    this.log(`${node.name}(${node.type}) deleted.`);
  }

  /** Get an interface by its mac address */
  getInterfaceByMac(macString: string) {
    for (const node of Object.values(this.nodes)) {
      for (const netInterface of Object.values(node.interfaces)) {
        if (toHexString(netInterface.mac, ":") === macString) {
          return netInterface;
        }
      }
    }
    return "not found";
  }
}
