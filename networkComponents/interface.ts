import EthFrame from "../protocols/ethernet.ts";
import Node from "./node.ts";
import { toHexString } from "../utils.ts";
import { EventEmitter } from "https://deno.land/x/event_emitter/mod.ts";
import { IPacket, ARPacket } from "../protocols/packet.ts";
import { ICMPing } from "../protocols/protocols.ts";

type ARPTable = {
  [key: string]: Uint8Array;
};

interface Events {
  send: (frame: EthFrame, from: NetInterface, to: NetInterface) => void;
  receive: (frame: EthFrame, from: NetInterface) => void;
}

export default class NetInterface extends EventEmitter<Events> {
  arpTable: ARPTable = {};
  mac: Uint8Array;
  ipv4: Uint8Array;
  connectedTo: NetInterface | null = null;
  constructor(public name: string, public node: Node) {
    super();
    this.mac = Uint8Array.from(new Uint8Array(6), () =>
      Math.floor(Math.random() * 256)
    );
    while (this.node.network.macs.includes(toHexString(this.mac, ":")))
      this.mac[5] = this.mac[5] + 1;
    this.ipv4 = Uint8Array.from(new Uint8Array(4), () =>
      Math.floor(Math.random() * 256)
    );
    this.on("send", (frame, from, to) => {
      if (from !== this.connectedTo && to !== this) return;
      this.emit("receive", frame, from);
      this.node.receive(frame, this);
    });

    this.on("receive", (frame, from) => {
      if (from !== this.connectedTo) return;
      if (frame.type === 0x0806) {
        this.arpReceive(frame);
      }
    });
  }
  connect(netInterface: NetInterface): void {
    this.connectedTo = netInterface;
    netInterface.connectedTo = this;
    this.node.emit("connect", this, netInterface);
  }

  send(message: EthFrame): void {
    if (!this.connectedTo) return;
    this.emit("send", message, this, this.connectedTo);
  }

  disconnect(): void {
    if (!this.connectedTo) return;
    this.node.emit("disconnect", this, this.connectedTo);
    this.connectedTo.connectedTo = null;
    this.connectedTo = null;
  }

  icmpRequest(destinationAddress: Uint8Array) {
    this.send(
      new EthFrame(
        destinationAddress,
        this.mac,
        0x0800,
        new IPacket(this.ipv4, destinationAddress, new ICMPing(8), 1)
      )
    );
  }

  arpRequest(ipAddress: Uint8Array) {
    this.send(
      new EthFrame(
        Uint8Array.of(0xff, 0xff, 0xff, 0xff, 0xff, 0xff),
        this.mac,
        0x0806,
        new ARPacket(
          1,
          this.mac,
          this.ipv4,
          Uint8Array.of(0, 0, 0, 0, 0, 0),
          ipAddress
        )
      )
    );
  }

  arpReceive(frame: EthFrame) {
    const arpPacket = frame.data as ARPacket;
    if (arpPacket.opcode === 1) {
      this.arpTable[toHexString(arpPacket.targetIPAddress)] =
        arpPacket.senderMacAddress;
      // send a reply to the sender
      this.send(
        new EthFrame(
          arpPacket.senderMacAddress,
          this.mac,
          0x0806,
          new ARPacket(
            2,
            this.mac,
            this.ipv4,
            arpPacket.senderMacAddress,
            arpPacket.targetIPAddress
          )
        )
      );
    }
    if (arpPacket.opcode === 2) {
      this.arpTable[toHexString(arpPacket.senderIPAddress)] =
        arpPacket.senderMacAddress;
    }
  }
}
