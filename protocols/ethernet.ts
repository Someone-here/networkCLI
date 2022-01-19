import { IPacket, ARPacket } from "./packet.ts";

export default class EthFrame {
  crc = 0xffffffff;
  dataRaw: Uint8Array;
  constructor(
    public destinationAddress: Uint8Array,
    public sourceAddress: Uint8Array,
    public type: number,
    public data: IPacket | ARPacket,
    padding = true
  ) {
    this.dataRaw = data.raw();
    if (this.dataRaw.length > 1500) {
      throw new Error("Data length must be less than 1500");
    }

    if (this.dataRaw.length < 46 && padding) {
      const padding = new Uint8Array(46 - this.dataRaw.length);
      this.dataRaw = new Uint8Array([...this.dataRaw, ...padding]);
    }

    this.crc = this.calculateCRC32();
  }

  private calculateCRC32() {
    let crc = 0xffffffff;
    for (let i = 0; i < this.dataRaw.length; i++) {
      crc = crc ^ this.dataRaw[i];
      for (let j = 0; j < 8; j++) {
        if (crc & 1) {
          crc = (crc >> 1) ^ 0xedb88320;
        } else {
          crc = crc >> 1;
        }
      }
    }
    return crc ^ 0xffffffff;
  }

  raw(): Uint8Array {
    const result = new Uint8Array(26 + this.dataRaw.length);
    const ethType = Uint8Array.of(this.type >> 8, this.type & 0xff);
    const preamble = Uint8Array.of(170, 170, 170, 170, 170, 170, 170);
    const SFD = Uint8Array.of(171);
    result.set(preamble, 0);
    result.set(SFD, 7);
    result.set(this.destinationAddress, 8);
    result.set(this.sourceAddress, 14);
    result.set(ethType, 20);
    result.set(this.dataRaw, 22);
    result.set(
      Uint8Array.of(
        this.crc >> 24,
        (this.crc >> 16) & 0xff,
        (this.crc >> 8) & 0xff,
        this.crc & 0xff
      ),
      22 + this.dataRaw.length
    );
    return result;
  }
}
