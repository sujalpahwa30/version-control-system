#!/usr/bin/env node 

const { Command } = require('commander'); 

const initCommand = require('../src/commands/init'); 
const addCommand = require('../src/commands/add');
const commitCommand = require('../src/commands/commit');
const logCommand = require('../src/commands/log');

const program = new Command(); 

program 
    .name("orion")
    .description("A simple version control system")
    .version("1.0.0");

initCommand(program); 
addCommand(program);
commitCommand(program); 
logCommand(program); 

program.parse(process.argv); 