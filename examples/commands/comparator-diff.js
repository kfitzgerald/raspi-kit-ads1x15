"use strict";

module.exports = function(program) {

    //noinspection JSUnusedLocalSymbols
    program
        .command('comparator-diff <chip> <high> <low>')
        .option('-d, --differential <differential>', 'Channel set to diff (0, 1, 2 or 3). 0=1-0, 1=3-0, 2=3-1, 3=3-2. Default: 0 (1-0 or channel 1 minus 0)', 0)
        .option('-a, --address <address>', 'I2C address to find the chip at (0-3). 0=0x48, 1=0x49, 2=0x4A, 3=0x4B. Default: 0 (0x48) ', 0)
        .option('-p, --pga <pga>', 'Power Gain Amplifier, 0-5. 0=+/-0.256V, 1=+/-0.512V, 2=+/-1.024V, 3=+/-2.048V, 4=+/-4.096V, 5=+/-6.144V. Default 4 (+/-4.096V)', 4)
        .option('-s, --sps <sps>', 'Samples per second. ADS1015 (128, 250, 490, 920, 1600, 2400, 3300), ADS1115 (8, 16, 32, 64, 128, 250, 475, 860). Default: 250', 250)
        .option('-i, --interval <interval>', 'Number of milliseconds between readings. Default 500', 500)
        .option('-m, --comparator-mode <comparatorMode>', 'Mode of comparison, 0 or 1. 0=Traditional, 1=Window. Default: 1', 1)
        .option('-t, --active-mode <activeMode>', 'Active mode, 0 or 1. 0=ACTIVE_LOW, 1=ACTIVE_HIGH, Default: 1', 1)
        .option('-l, --latching-mode <latchingMode>', 'Latching mode, 0 or 1. 0=LATCHING, 1=NON_LATCHING. Default: 1', 1)
        .option('-r, --readings <readings>', 'Number of readings before triggering the alert, 1, 2 or 4. Default: 1', 1)
        .option('-v, --volts', 'Whether to treat the high and low values in Volts instead of ADC integer value. Default: false', false)
        .description('Reads a single-ended channel continuously using the built-in comparator to trigger the alert pin')
        .action(function(chip, high, low, options) {

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

            // Parse comparator mode
            const comparatorMode = util.validateComparatorMode(options.comparatorMode);
            console.log('Compare Mode:\t' + comparatorMode.name);

            // Parse active mode
            const comparatorActiveMode = util.validateActiveMode(options.activeMode);
            console.log('Active Mode:\t' + comparatorActiveMode.name);

            // Parse latching mode
            const comparatorLatchingMode = util.validateLatchingMode(options.latchingMode);
            console.log('Latching Mode:\t' + comparatorLatchingMode.name);

            // Parse readings count
            const comparatorReadings = util.validateReadingsCount(options.readings);
            console.log('Readings Count:\t' + comparatorReadings.name);

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

                // Parse high threshold
                high = util.validateThresholdValue(chip.value, options.volts ? adc.getThresholdFromVolts(parseFloat(high), pga.value) : high, 'high');
                console.log(`High Threshold:\t${high}  (${adc.getVoltageFromValue(high, adc.pga)}V)`);

                // Parse low threshold
                low = util.validateThresholdValue(chip.value, options.volts ? adc.getThresholdFromVolts(parseFloat(low), pga.value) : low, 'low');
                console.log(`Low Threshold:\t${low}  (${adc.getVoltageFromValue(low, adc.pga)}V)`);

                let done = false;

                // Graceful shutdown
                process.once('SIGTERM', () => done = true);
                process.once('SIGINT', () => done = true);

                console.log('Starting continuous readings. (Control-C to cancel)');
                console.log();
                console.log('Differential            \tValue\tVolts');

                adc.startComparatorDifferential(differential.value, high, low, {
                    comparatorMode: comparatorMode.value,
                    comparatorActiveMode: comparatorActiveMode.value,
                    comparatorLatchingMode: comparatorLatchingMode.value,
                    comparatorReadings: comparatorReadings.value
                }, (err, value, volts) => {
                    if (err) {
                        console.log('ERROR', err);
                    } else {
                        console.log(`Channel ${differential.name}:\t${value}\t${volts}`);
                    }

                    setTimeout(() => {

                        // Get latest readings until cancelled
                        Async.whilst(
                            () => done === false,
                            (nextReading) => {
                                adc.getLastReading((err, value, volts) => {
                                    if (err) {
                                        console.log('ERROR', err);
                                    } else {
                                        console.log(`Channel ${differential.name}:\t${value}\t${volts}`);
                                    }

                                    setTimeout(() => nextReading(err), interval);
                                });
                            },
                            (/*err*/) => {
                                adc.stopContinuousReadings((/*err*/) => {
                                    // DONE!
                                    console.log('\nFinished readings.\n');
                                });
                            }
                        );

                    }, interval);
                });

            });

        })
    ;
};