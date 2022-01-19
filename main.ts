import Network from "./network.ts";
import Client from "./networkComponents/client.ts";
import Switch from "./networkComponents/switch.ts";

const network = new Network();
const cl = new Client("cl", network);
const cl1 = new Client("cl1", network);
const sw = new Switch("sw", network);
network.connect(cl.interfaces.eth0, sw.interfaces.eth0);
network.connect(cl1.interfaces.eth0, sw.interfaces.eth1);

let input;
while (true) {
  input = prompt("\n -> ", "");
  if (input)
    try {
      console.log(eval(input));
    } catch (e) {
      console.log(e);
    }
}
