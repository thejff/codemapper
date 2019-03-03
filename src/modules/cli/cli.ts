import { exit } from "shelljs";
import { Mapper } from "../mapper/mapper";
import { IMapper } from "../../shared/interface/mapper.interface";
import { ICLI } from "../../shared/interface/cli.interface";
const figlet = require("figlet");
const readline = require("readline");
const fs = require("fs");

export class CLI implements ICLI {
  private regex: null | RegExp = null;
  private mapper: null | IMapper = null;
  private excludeNodeModules = true;

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
    1. Input a directory to map
    2. Map from current directory
    `);
    console.log("Or use one the following commands:");
    console.log(`
      q: Quit
      menu: Return here
    `);

    console.log("\n");
    this.inputHandler();
  }

  private inputHandler(): void {
    this.getInput("What do you want to do: ")
      .then((input: string) => {
        switch (input) {
          case "1":
            this.inputDirectory();
            break;
          case "2":
            this.mapCurrentDirectory();
            break;
          case "d":
            this.debug();
            break;
          default:
            console.log("Please select an option...");
            this.inputHandler();
            break;
        }
      })
      .catch((err: unknown) => {
        console.error(err);
      });
  }

  private inputDirectory(): void {
    // "G:/Code/Just For Fun Foundation/dependency-mapper/test/"

    this.getInput("Please enter the directory to map: ")
      .then((directory: string) => {
        fs.stat(directory, (err: Error, data: any) => {
          if (err) {
            console.log("The path entered is not a directory!");
            this.inputDirectory();
          } else {
            if (data.isDirectory()) {
              if (this.regex) {
                this.mapper = new Mapper(
                  directory,
                  this.excludeNodeModules,
                  this.regex
                );
              } else {
                this.mapper = new Mapper(directory, this.excludeNodeModules);
              }

              this.mapper.startProcessing();
            } else {
              console.log("The path entered is not a directory!");
              this.inputDirectory();
            }
          }
        });
      })
      .catch((err: unknown) => {
        console.error(err);
      });
  }

  private debug(): void {
    this.mapper = new Mapper(
      "G:/Code/Just For Fun Foundation/dependency-mapper/test/",
      this.excludeNodeModules
    );

    this.mapper.startProcessing();
  }

  private mapCurrentDirectory(): void {
    console.log("This will map from: " + __dirname);
    this.getInput("Continue? (Y/n): ")
      .then((input: string) => {
        switch (input) {
          case "n":
            break;
          default:
            console.log("Mapping current directory...");
            break;
        }
      })
      .catch((err: unknown) => {
        console.error(err);
      });
  }

  private setOptions(): void {
    this.getInput("Do you want to map node_modules? (y/N): ")
      .then((input: string) => {
        switch (input) {
        }

        return this.getInput("Custom regex (blank for default): ");
      })
      .then((regex: string) => {
        if (regex !== "" || regex !== undefined || regex !== null) {
          this.regex = new RegExp(regex);
        }
      })
      .catch((err: unknown) => {
        console.error(err);
      });
  }

  private getInput(request: string): Promise<string> {
    return new Promise((resolve) => {
      const readlineInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      readlineInterface.question(request, (answer: string) => {
        readlineInterface.close();
        switch (answer) {
          case "q":
            exit(0);
            break;
          case "menu":
            this.start();
            break;
          default:
            resolve(answer);
            break;
        }
      });
    });
  }
}
