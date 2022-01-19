// import Switch from "../Network/networkComponents/switch";
// import Client from "../Network/networkComponents/client";

/** convert a string to an ASCII equivalent Uint8Array */
export function stringToBinary(str: string): Uint8Array {
  const result = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    result[i] = str.charCodeAt(i);
  }
  return result;
}

/** convert a Uint8Array to a string */
export function binaryToString(byteArray: Uint8Array): string {
  let result = "";
  for (let i = 0; i < byteArray.length; i++) {
    result += String.fromCharCode(byteArray[i]);
  }
  return result;
}

/** Show a byte array as a hex  string */
export function toHexString(byteArray: Uint8Array, separator = ""): string {
  return Array.prototype.map
    .call(byteArray, function (byte: number) {
      return ("0" + (byte & 0xff).toString(16)).slice(-2);
    })
    .join(separator);
}

/** Show a byte array as a binary string */
export function toBinaryString(byteArray: Uint8Array, separator = ""): string {
  return Array.prototype.map
    .call(byteArray, function (byte: number) {
      return ("00000000" + (byte & 0xff).toString(2)).slice(-8);
    })
    .join(separator);
}
