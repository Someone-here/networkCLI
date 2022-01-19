export class ICMPing {
  checkSum = 0;
  /** types:
   *  8 - request
   *  0 - reply
   */
  constructor(
    public type: 8 | 0,
    public data?: Uint8Array,
    public code: number = 0,
    public id = Math.floor(Math.random() * 65536),
    public seqNum = 0
  ) {
    if (!this.data) {
      this.data = new Uint8Array(32);
      for (let i = 0; i < this.data.length; i++) {
        this.data[i] = Math.floor(Math.random() * 256);
      }
    }
    this.checkSum = this.calculateCheckSum();
  }

  calculateCheckSum() {
    let sum = 0;
    for (let i = 0; i < this.data!.length; i++) {
      sum += this.data![i];
    }
    return sum;
  }

  raw(): Uint8Array {
    const packet = new Uint8Array(8 + this.data!.length);
    let offset = 0;
    packet[offset++] = this.type;
    packet[offset++] = this.code;
    packet[offset++] = (this.checkSum >> 8) & 0xff;
    packet[offset++] = this.checkSum & 0xff;
    packet[offset++] = (this.id >> 8) & 0xff;
    packet[offset++] = this.id & 0xff;
    packet[offset++] = (this.seqNum >> 8) & 0xff;
    packet[offset++] = this.seqNum & 0xff;
    for (let i = 0; i < this.data!.length; i++) {
      packet[offset++] = this.data![i];
    }
    return packet;
  }
}

export class TCP {
  constructor() {}
}

export class UDP {
  constructor() {}
}
