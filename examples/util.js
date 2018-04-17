"use strict";

const ADS1x15 = require('../ADS1x15');

module.exports.validateChip = (chip) => {
    if (/1015/.test(chip)) {
        chip = { value: ADS1x15.chips.IC_ADS1015, name: 'ADS1015' };
    } else if (/1115/.test(chip)) {
        chip = { value: ADS1x15.chips.IC_ADS1115, name: 'ADS1115' };
    } else {
        console.error('Invalid chip. Must be 1015, 1115, ADS1015 or ADS1115.');
        return process.exit(1);
    }
    return chip;
};

module.exports.validateAddress = (address) => {
    const addressMap = new Map([
        [0, { value: ADS1x15.address.ADDRESS_0x48, name: '0x48' }],
        [1, { value: ADS1x15.address.ADDRESS_0x49, name: '0x49' }],
        [2, { value: ADS1x15.address.ADDRESS_0x4A, name: '0x4A' }],
        [3, { value: ADS1x15.address.ADDRESS_0x4B, name: '0x4B' }]
    ]);
    address = addressMap.get(parseInt(address));
    if (!address) {
        console.error('Invalid I2C address. Must be 0-3. (0=0x48, 1=0x49, 2=0x4A, 3=0x4B)');
        return process.exit(1);
    }
    return address;
};

module.exports.validateChannel = (channel) => {
    const channelMap = new Map([
        [0, { value: ADS1x15.channel.CHANNEL_0, name: '0' }],
        [1, { value: ADS1x15.channel.CHANNEL_1, name: '1' }],
        [2, { value: ADS1x15.channel.CHANNEL_2, name: '2' }],
        [3, { value: ADS1x15.channel.CHANNEL_3, name: '3' }],
    ]);
    channel = channelMap.get(parseInt(channel));
    if (!channel) {
        console.error('Invalid channel number. Must be 0-3.');
        return process.exit(1);
    }
    return channel;
};

module.exports.validateDifferential = (differential) => {
    const differentialMap = new Map([
        [0, { value: ADS1x15.differential.DIFF_0_1, name: '0_1 (1 minus 0)' }],
        [1, { value: ADS1x15.differential.DIFF_0_3, name: '0_3 (3 minus 0)' }],
        [2, { value: ADS1x15.differential.DIFF_1_3, name: '1_3 (3 minus 1)' }],
        [3, { value: ADS1x15.differential.DIFF_2_3, name: '2_3 (3 minus 2)' }],
    ]);
    differential = differentialMap.get(parseInt(differential));
    if (!differential) {
        console.error('Invalid channel differential. Must be 0, 1, 2 or 3.');
        return process.exit(1);
    }
    return differential;
};

module.exports.validatePGA = (pga) => {
    const pgaMap = new Map([
        [0, { value: ADS1x15.pga.PGA_0_256V, name: '+/- 0.256V' }],
        [1, { value: ADS1x15.pga.PGA_0_512V, name: '+/- 0.512V' }],
        [2, { value: ADS1x15.pga.PGA_1_024V, name: '+/- 1.024V' }],
        [3, { value: ADS1x15.pga.PGA_2_048V, name: '+/- 2.048V' }],
        [4, { value: ADS1x15.pga.PGA_4_096V, name: '+/- 4.098V' }],
        [5, { value: ADS1x15.pga.PGA_6_144V, name: '+/- 6.144V' }],
    ]);

    pga = pgaMap.get(parseInt(pga));
    if (!pga) {
        console.error('Invalid power-gain amplifier. Must be 0-5. (0=+/-0.256V, 1=+/-0.512V, 2=+/-1.024V, 3=+/-2.048V, 4=+/-4.096V, 5=+/-6.144V)');
        return process.exit(1);
    }
    return pga;
};

module.exports.validateSPS = (chip, sps) => {
    const sps1015Map = new Map([
        [128, { value: ADS1x15.spsADS1015.SPS_128, name: '128 samples per second' }],
        [250, { value: ADS1x15.spsADS1015.SPS_250, name: '250 samples per second' }],
        [490, { value: ADS1x15.spsADS1015.SPS_490, name: '490 samples per second' }],
        [920, { value: ADS1x15.spsADS1015.SPS_920, name: '920 samples per second' }],
        [1600, { value: ADS1x15.spsADS1015.SPS_1600, name: '1600 samples per second' }],
        [2400, { value: ADS1x15.spsADS1015.SPS_2400, name: '2400 samples per second' }],
        [3300, { value: ADS1x15.spsADS1015.SPS_3300, name: '3300 samples per second' }],
    ]);

    const sps1115Map = new Map([
        [8, { value: ADS1x15.spsADS1115.SPS_8, name: '8 samples per second' }],
        [16, { value: ADS1x15.spsADS1115.SPS_16, name: '16 samples per second' }],
        [32, { value: ADS1x15.spsADS1115.SPS_32, name: '32 samples per second' }],
        [64, { value: ADS1x15.spsADS1115.SPS_64, name: '64 samples per second' }],
        [128, { value: ADS1x15.spsADS1115.SPS_128, name: '128 samples per second' }],
        [250, { value: ADS1x15.spsADS1115.SPS_250, name: '250 samples per second' }],
        [475, { value: ADS1x15.spsADS1115.SPS_475, name: '475 samples per second' }],
        [860, { value: ADS1x15.spsADS1115.SPS_860, name: '860 samples per second' }],
    ]);

    sps = (chip.value === ADS1x15.chips.IC_ADS1015 ? sps1015Map : sps1115Map).get(parseInt(sps));
    if (!sps) {
        console.error('Invalid samples per second data rate.\n > For ADS1015 (128, 250, 490, 920, 1600, 2400, 3300)\n > ADS1115 (8, 16, 32, 64, 128, 250, 475, 860)');
        return process.exit(1);
    }
    return sps;
};

module.exports.validateInterval = (interval) => {
    interval = parseInt(interval);
    if (!interval || interval <= 0) {
        console.error('Interval must be a number, larger than zero. Value is in milliseconds.');
        return process.exit(1);
    }
    return interval;
};

module.exports.validateComparatorMode = (mode) => {
    const comparatorModeMap = new Map([
        [0, { value: ADS1x15.comparatorMode.TRADITIONAL, name: 'Traditional'}],
        [1, { value: ADS1x15.comparatorMode.TRADITIONAL, name: 'Window'}],
    ]);
    mode = comparatorModeMap.get(parseInt(mode));
    if (!mode) {
        console.error('Invalid comparator mode. Must be 0 or 1. 0=Traditional, 1=Window.');
        return process.exit(1);
    }
    return mode;
};

module.exports.validateActiveMode = (mode) => {
    const activeModeMap = new Map([
        [0, { value: ADS1x15.comparatorActiveMode.ACTIVE_LOW, name: 'Low'}],
        [1, { value: ADS1x15.comparatorActiveMode.ACTIVE_HIGH, name: 'High'}],
    ]);
    mode = activeModeMap.get(parseInt(mode));
    if (!mode) {
        console.error('Invalid active mode. Must be 0 or 1. 0=ACTIVE_LOW, 1=ACTIVE_HIGH');
        return process.exit(1);
    }
    return mode;
};

module.exports.validateLatchingMode = (mode) => {
    const latchingModeMap = new Map([
        [0, { value: ADS1x15.comparatorLatchingMode.LATCHING, name: 'Latching'}],
        [1, { value: ADS1x15.comparatorLatchingMode.NON_LATCHING, name: 'Non-Latching'}],
    ]);
    mode = latchingModeMap.get(parseInt(mode));
    if (!mode) {
        console.error('Invalid latching mode. Must be 0 or 1. 0=LATCHING, 1=NON_LATCHING');
        return process.exit(1);
    }
    return mode;
};

module.exports.validateReadingsCount = (count) => {
    const readingsMap = new Map([
        [1, { value: ADS1x15.comparatorReadings.READINGS_1, name: '1 Reading'}],
        [2, { value: ADS1x15.comparatorReadings.READINGS_2, name: '2 Readings'}],
        [4, { value: ADS1x15.comparatorReadings.READINGS_4, name: '4 Readings'}],
    ]);
    count = readingsMap.get(parseInt(count));
    if (!count) {
        console.error(`Invalid readings count ${count}. Must be 1, 2 or 4.`);
        return process.exit(1);
    }
    return count;
};

module.exports.validateThresholdValue = (chip, value, name) => {
    value = parseInt((""+value).replace(/n/, '-'));
    const max = chip.value === ADS1x15.chips.IC_ADS1015 ? ADS1x15.thresholdMaxValues.ADS1015_MAX_RANGE : ADS1x15.thresholdMaxValues.ADS1115_MAX_RANGE;
    if (!((value >= (-1 * max)) && (value <= (max-1)))) { // between -max and +(max-1) for the chip
        console.error(`Invalid ${name} threshold value: ${value}. Must be between ${-1 * max} and ${max-1}`);
        return process.exit(1);
    }
    return value;
};