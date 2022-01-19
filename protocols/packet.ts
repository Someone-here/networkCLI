import { ICMPing } from "./protocols.ts";

type IPPacketInfo = {
  version: 4 | 6;
  headerLength: 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
  typeOfService: 0 | 1 | 8 | 16 | 24 | 32 | 40 | 48;
  identification: number;
  flags: 0 | 1 | 2;
  fragmentOffset: number;
  timeToLive: number;
  options: number[];
};

export class IPacket {
  headerChecksum = 0;
  totalLength = 0;
  /** An IP packet |
   *  protocols:
   *  TCP - 6,
   *  UDP - 17,
   *  ICMP - 1,
   */
  constructor(
    public sourceAddress: Uint8Array,
    public destinationAddress: Uint8Array,
    public data: ICMPing,
    public protocol = 6, // tcp
    public info: IPPacketInfo = {
      version: 4, // IPv4
      headerLength: 5, // 20 bytes (5 * 4) minimum header length
      typeOfService: 0, // CS0
      identification: 0,
      flags: 2, // don't fragment
      fragmentOffset: 0,
      timeToLive: 64,
      options: [],
    }
  ) {
    this.headerChecksum = this.calculateHeaderChecksum();
  }
  calculateHeaderChecksum() {
    let checksum = 0;
    const header = this.rawHeader();
    for (let i = 0; i < header.length; i++) {
      checksum += header[i];
    }
    return checksum;
  }

  rawHeader(): Uint8Array {
    return this.raw().slice(0, this.info.headerLength * 4);
  }

  raw(): Uint8Array {
    this.totalLength = this.info.headerLength * 4 + this.data.raw().length;
    if (this.info.version === 6) throw new Error("IPv6 not supported");
    const packet = new Uint8Array(this.totalLength);
    let offset = 0;
    packet[offset++] = (this.info.version << 4) + this.info.headerLength;
    packet[offset++] = this.info.typeOfService << 2;
    packet[offset++] = (this.totalLength >> 8) & 0xff;
    packet[offset++] = this.totalLength & 0xff;
    packet[offset++] = (this.info.identification >> 8) & 0xff;
    packet[offset++] = this.info.identification & 0xff;
    packet[offset++] = (this.info.flags << 5) + (this.info.fragmentOffset >> 8);
    packet[offset++] = this.info.fragmentOffset & 0xff;
    packet[offset++] = this.info.timeToLive;
    packet[offset++] = this.protocol;
    packet[offset++] = (this.headerChecksum >> 8) & 0xff;
    packet[offset++] = this.headerChecksum & 0xff;
    packet[offset++] = this.sourceAddress[0];
    packet[offset++] = this.sourceAddress[1];
    packet[offset++] = this.sourceAddress[2];
    packet[offset++] = this.sourceAddress[3];
    packet[offset++] = this.destinationAddress[0];
    packet[offset++] = this.destinationAddress[1];
    packet[offset++] = this.destinationAddress[2];
    packet[offset++] = this.destinationAddress[3];

    for (let i = 0; i < this.info.options.length; i++) {
      packet[offset++] = this.info.options[i];
    }
    const data = this.data.raw();

    for (let i = 0; i < data.length; i++) {
      packet[offset++] = data[i];
    }
    return packet;
  }
}

/** Address Resolution Protocol */
export class ARPacket {
  hardwareType = 1; // Ethernet
  protocolType = 0x800; // Ipv4
  hardwareSize = 6;
  protocolSize = 4;
  /** opcode: 1 - request, 2 - reply */
  constructor(
    public opcode: number,
    public senderMacAddress: Uint8Array,
    public senderIPAddress: Uint8Array,
    public targetMacAddress: Uint8Array,
    public targetIPAddress: Uint8Array
  ) {}
  raw(): Uint8Array {
    const packet = new Uint8Array(42);
    let offset = 0;
    packet[offset++] = (this.hardwareType >> 8) & 0xff;
    packet[offset++] = this.hardwareType & 0xff;
    packet[offset++] = (this.protocolType >> 8) & 0xff;
    packet[offset++] = this.protocolType & 0xff;
    packet[offset++] = this.hardwareSize;
    packet[offset++] = this.protocolSize;
    packet[offset++] = (this.opcode >> 8) & 0xff;
    packet[offset++] = this.opcode & 0xff;
    for (let i = 0; i < 6; i++) {
      packet[offset++] = this.senderMacAddress[i];
    }
    for (let i = 0; i < 4; i++) {
      packet[offset++] = this.senderIPAddress[i];
    }
    for (let i = 0; i < 6; i++) {
      packet[offset++] = this.targetMacAddress[i];
    }
    for (let i = 0; i < 4; i++) {
      packet[offset++] = this.targetIPAddress[i];
    }
    return packet;
  }
}
