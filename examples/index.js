"use strict";

const FS = require('fs');
const Path = require('path');

const program = require('commander');
program.version(require('../package.json').version);

const commandPath = Path.join(__dirname, 'commands');

// Load commands
FS.readdir(commandPath, (err, files) => {
    if (err) {
        console.error('Blew up trying to load commands!', err);
        return process.exit(1);
    }

    const commandTest = /^(?!index).*\.js$/;

    files
        .filter((file) => commandTest.test(file))
        .forEach((file) => require(Path.join(commandPath, file))(program), this);

    // Default help
    program
        .command('*')
        .usage('')
        .action(function(cmd) {
            console.error('');
            console.error('Invalid command: ' + cmd);
            program.help();
        });

    // Help command
    program.on('--help', function() {
        console.log('  Examples:');
        // TODO
        console.log('');
    });

    // Run it
    program.parse(process.argv);

    // No command? HELP!
    if (!program.args.length) program.help();

});