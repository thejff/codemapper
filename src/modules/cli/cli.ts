import { Walker } from "../walker/walker";
const figlet = require("figlet");
const readline = require("readline");

export class CLI {
  public start(): void {
    console.clear();
    console.log(figlet.textSync("Just For Fun", { font: "doom" }));
    console.log("\n");

    console.log(
      "Welcome to the Just For Fun foundation's Typescript and Angular dependency mapper.\n For more projects check out: https:\\\\thejustforfun.foundation"
    );
    console.log("\n");
    console.log("You can use the following commands to generate a map:");
    console.log(`
    1. Select directory to map
    `);

    console.log("\n");

    this.getInput("What do you want to do: ")
      .then((input: string) => {
        // console.log("You selected: " + input);
        const walker = new Walker();
        walker.walk();
      })
      .catch((err: unknown) => {
        console.error(err);
      });
  }

  private getInput(request: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const readlineInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      readlineInterface.question(request, (answer: string) => {
        resolve(answer);
        readlineInterface.close();
      });
    });
  }
}
