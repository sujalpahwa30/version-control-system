#!/usr/bin/env node 

const { Command } = require("commander"); 

const initCommand = require("../src/commands/init"); 

const program = new Command(); 

program 
    .name("orion")
    .description("A simple version control system")
    .version("1.0.0");

initCommand(program); 

program.parse(process.argv); 