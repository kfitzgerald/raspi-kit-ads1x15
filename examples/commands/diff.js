"use strict";

module.exports = function(program) {

    //noinspection JSUnusedLocalSymbols
    program
        .command('diff <chip>')
        .option('-d, --differential <differential>', 'Channel set to diff (0, 1, 2 or 3). 0=1-0, 1=3-0, 2=3-1, 3=3-2. Default: 0 (1-0 or channel 1 minus 0)', 0)
        .option('-a, --address <address>', 'I2C address to find the chip at (0-3). 0=0x48, 1=0x49, 2=0x4A, 3=0x4B. Default: 0 (0x48) ', 0)
        .option('-p, --pga <pga>', 'Power Gain Amplifier, 0-5. 0=+/-0.256V, 1=+/-0.512V, 2=+/-1.024V, 3=+/-2.048V, 4=+/-4.096V, 5=+/-6.144V. Default 4 (+/-4.096V)', 4)
        .option('-s, --sps <sps>', 'Samples per second. ADS1015 (128, 250, 490, 920, 1600, 2400, 3300), ADS1115 (8, 16, 32, 64, 128, 250, 475, 860). Default: 250', 250)
        .option('-i, --interval <interval>', 'Number of milliseconds between readings. Default 500', 500)
        .description('Reads the difference between two channels.')
        .action(function(chip, options) {

            const raspi = require('raspi');
            const I2C = require('raspi-i2c').I2C;
            const Async = require('async');
            const ADS1x15 = require('../../ADS1x15');
            const util = require('../util');

            // Parse chip
            chip = util.validateChip(chip);
            console.log('Chip:   \t' + chip.name);

            // Parse address
            const address = util.validateAddress(options.address);
            console.log('Address:\t' + address.name);

            // Parse channel
            const differential = util.validateDifferential(options.differential);
            console.log('Diff:   \t' + differential.name);

            // Parse PGA
            const pga = util.validatePGA(options.pga);
            console.log('PGA:    \t' + pga.name);

            // Parse sps
            const sps = util.validateSPS(chip, options.sps);
            console.log('SPS:    \t' + sps.name);

            // Parse interval
            const interval = util.validateInterval(options.interval);
            console.log('Interval:\t' + interval);

            // Init Raspi
            raspi.init(() => {
                // Init Raspi-i2c
                const i2c = new I2C();

                // Init the ADC
                const adc = new ADS1x15({
                    i2c,
                    chip: chip.value,
                    address: address.value,
                    pga: pga.value,
                    sps: sps.value
                });

                let done = false;

                // Graceful shutdown
                process.once('SIGTERM', () => done = true);
                process.once('SIGINT', () => done = true);

                console.log('Starting readings. (Control-C to cancel)');
                console.log();
                console.log('Differential           \tValue\tVolts');

                // Read until cancelled
                Async.whilst(
                    () => done === false,
                    (nextReading) => {
                        adc.readDifferential(differential.value, (err, value, volts) => {
                            if (err) {
                                console.log('ERROR', err);
                            } else {
                                console.log(`Diff ${differential.name}:\t${value}\t${volts}`);
                            }

                            setTimeout(() => nextReading(err), interval);
                        });
                    },
                    (/*err*/) => {
                        // DONE!
                        console.log('\nFinished readings.\n');
                    }
                );

            });
        })
    ;
};