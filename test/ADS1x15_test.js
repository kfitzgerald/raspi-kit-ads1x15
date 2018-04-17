"use strict";

const should = require('should');
const FauxI2C = require('faux-i2c');

describe('ADS1x15', () => {

    const ADS1x15 = require('../ADS1x15');
    const i2c = new FauxI2C();

    describe('construction', () => {

        it('should instantiate with most defaults', () => {
            const adc = new ADS1x15({ i2c });
            should(adc).be.ok();
            adc.should.be.instanceOf(ADS1x15);
        });

        it('should instantiate with non-defaults', () => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015,
                address: ADS1x15.address.ADDRESS_0x49,
                pga: ADS1x15.pga.PGA_4_096V,
                sps: ADS1x15.spsADS1015.SPS_3300,
                spsExtraDelay: 2
            });
            should(adc).be.ok();
            adc.should.be.instanceOf(ADS1x15);

            adc.chip.should.be.exactly(ADS1x15.chips.IC_ADS1015);
            adc.address.should.be.exactly(ADS1x15.address.ADDRESS_0x49);
            adc.pga.should.be.exactly(ADS1x15.pga.PGA_4_096V);
            adc.sps.should.be.exactly(ADS1x15.spsADS1015.SPS_3300);
            adc.spsExtraDelay.should.be.exactly(2);
        });

    });

    describe('_getDefaultSPS', () => {

        it('should return proper values for ADS1015', () => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc._getDefaultSPS().should.be.exactly(ADS1x15.spsADS1015.SPS_1600);
        });

        it('should return proper values for ADS1115', () => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1115
            });

            adc._getDefaultSPS().should.be.exactly(ADS1x15.spsADS1115.SPS_250);
        });

    });

    describe('_isValidChannel', () => {

        it('should validate channel values', function () {

            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            // bogus values
            adc._isValidChannel().should.be.exactly(false);
            adc._isValidChannel('nope').should.be.exactly(false);

            // real values
            adc._isValidChannel(ADS1x15.channel.CHANNEL_0).should.be.exactly(true);
            adc._isValidChannel(ADS1x15.channel.CHANNEL_1).should.be.exactly(true);
            adc._isValidChannel(ADS1x15.channel.CHANNEL_2).should.be.exactly(true);
            adc._isValidChannel(ADS1x15.channel.CHANNEL_3).should.be.exactly(true);
        });
    });

    describe('_isValidDifferential', () => {

        it('should validate differential values', function () {

            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            // bogus values
            adc._isValidDifferential().should.be.exactly(false);
            adc._isValidDifferential('nope').should.be.exactly(false);

            // real values
            adc._isValidDifferential(ADS1x15.differential.DIFF_0_1).should.be.exactly(true);
            adc._isValidDifferential(ADS1x15.differential.DIFF_0_3).should.be.exactly(true);
            adc._isValidDifferential(ADS1x15.differential.DIFF_1_3).should.be.exactly(true);
            adc._isValidDifferential(ADS1x15.differential.DIFF_2_3).should.be.exactly(true);
        });

    });

    describe('_isValidSPS', () => {

        it('should validate samples per second values for ADS1015', function () {

            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            // bogus values
            adc._isValidSPS().should.be.exactly(false);
            adc._isValidSPS('nope').should.be.exactly(false);

            // real values
            adc._isValidSPS(ADS1x15.spsADS1015.SPS_128).should.be.exactly(true);
            adc._isValidSPS(ADS1x15.spsADS1015.SPS_250).should.be.exactly(true);
            adc._isValidSPS(ADS1x15.spsADS1015.SPS_490).should.be.exactly(true);
            adc._isValidSPS(ADS1x15.spsADS1015.SPS_920).should.be.exactly(true);
            adc._isValidSPS(ADS1x15.spsADS1015.SPS_1600).should.be.exactly(true);
            adc._isValidSPS(ADS1x15.spsADS1015.SPS_2400).should.be.exactly(true);
            adc._isValidSPS(ADS1x15.spsADS1015.SPS_3300).should.be.exactly(true);

            // ADS1115 has a value the ADS1015 does not
            adc._isValidSPS(ADS1x15.spsADS1115.SPS_860).should.be.exactly(false);
        });

        it('should validate samples per second values for ADS1115', function () {

            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1115
            });

            // bogus values
            adc._isValidSPS().should.be.exactly(false);
            adc._isValidSPS('nope').should.be.exactly(false);

            // real values
            adc._isValidSPS(ADS1x15.spsADS1115.SPS_8).should.be.exactly(true);
            adc._isValidSPS(ADS1x15.spsADS1115.SPS_16).should.be.exactly(true);
            adc._isValidSPS(ADS1x15.spsADS1115.SPS_32).should.be.exactly(true);
            adc._isValidSPS(ADS1x15.spsADS1115.SPS_64).should.be.exactly(true);
            adc._isValidSPS(ADS1x15.spsADS1115.SPS_128).should.be.exactly(true);
            adc._isValidSPS(ADS1x15.spsADS1115.SPS_250).should.be.exactly(true);
            adc._isValidSPS(ADS1x15.spsADS1115.SPS_475).should.be.exactly(true);
            adc._isValidSPS(ADS1x15.spsADS1115.SPS_860).should.be.exactly(true);
        });

    });

    describe('_isValidPGA', () => {

        it('should validate pga values', function () {

            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            // bogus values
            adc._isValidPGA().should.be.exactly(false);
            adc._isValidPGA('nope').should.be.exactly(false);

            // real values
            adc._isValidPGA(ADS1x15.pga.PGA_0_256V).should.be.exactly(true);
            adc._isValidPGA(ADS1x15.pga.PGA_0_512V).should.be.exactly(true);
            adc._isValidPGA(ADS1x15.pga.PGA_1_024V).should.be.exactly(true);
            adc._isValidPGA(ADS1x15.pga.PGA_2_048V).should.be.exactly(true);
            adc._isValidPGA(ADS1x15.pga.PGA_4_096V).should.be.exactly(true);
            adc._isValidPGA(ADS1x15.pga.PGA_6_144V).should.be.exactly(true);
        });

    });

    describe('_isValidComparatorActiveMode', () => {

        it('should validate comparator active mode values', function () {

            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            // bogus values
            adc._isValidComparatorActiveMode().should.be.exactly(false);
            adc._isValidComparatorActiveMode('bogus').should.be.exactly(false);

            // real values
            adc._isValidComparatorActiveMode(ADS1x15.comparatorActiveMode.ACTIVE_HIGH).should.be.exactly(true);
            adc._isValidComparatorActiveMode(ADS1x15.comparatorActiveMode.ACTIVE_LOW).should.be.exactly(true);
        });

    });

    describe('_isValidComparatorMode', () => {

        it('should validate comparator mode values', function () {

            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            // bogus values
            adc._isValidComparatorMode().should.be.exactly(false);
            adc._isValidComparatorMode('bogus').should.be.exactly(false);

            // real values
            adc._isValidComparatorMode(ADS1x15.comparatorMode.TRADITIONAL).should.be.exactly(true);
            adc._isValidComparatorMode(ADS1x15.comparatorMode.WINDOW).should.be.exactly(true);
        });

    });

    describe('_isValidComparatorLatchingMode', () => {

        it('should validate comparator latching mode values', function () {

            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            // bogus values
            adc._isValidComparatorLatchingMode().should.be.exactly(false);
            adc._isValidComparatorLatchingMode('bogus').should.be.exactly(false);

            // real values
            adc._isValidComparatorLatchingMode(ADS1x15.comparatorLatchingMode.LATCHING).should.be.exactly(true);
            adc._isValidComparatorLatchingMode(ADS1x15.comparatorLatchingMode.NON_LATCHING).should.be.exactly(true);
        });

    });

    describe('_isValidComparatorReadingsCount', () => {

        it('should validate comparator readings count values', function () {

            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            // bogus values
            adc._isValidComparatorReadingsCount().should.be.exactly(false);
            adc._isValidComparatorReadingsCount('bogus').should.be.exactly(false);

            // real values
            adc._isValidComparatorReadingsCount(ADS1x15.comparatorReadings.DISABLED).should.be.exactly(true);
            adc._isValidComparatorReadingsCount(ADS1x15.comparatorReadings.READINGS_1).should.be.exactly(true);
            adc._isValidComparatorReadingsCount(ADS1x15.comparatorReadings.READINGS_2).should.be.exactly(true);
            adc._isValidComparatorReadingsCount(ADS1x15.comparatorReadings.READINGS_4).should.be.exactly(true);
        });

    });

    describe('_isValidComparatorThreshold', () => {

        it('should validate comparator threshold values for ADS1015', function () {

            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            // bogus values
            adc._isValidComparatorThreshold().should.be.exactly(false);
            adc._isValidComparatorThreshold('bogus').should.be.exactly(false);

            // real values
            adc._isValidComparatorThreshold(2047).should.be.exactly(true);
            adc._isValidComparatorThreshold(1).should.be.exactly(true);
            adc._isValidComparatorThreshold(0).should.be.exactly(true);
            adc._isValidComparatorThreshold(-1).should.be.exactly(true);
            adc._isValidComparatorThreshold(-2048).should.be.exactly(true);

            // outside threshold
            adc._isValidComparatorThreshold(2048).should.be.exactly(false);
            adc._isValidComparatorThreshold(-2049).should.be.exactly(false);

        });

        it('should validate comparator threshold values for ADS1115', function () {

            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1115
            });

            // bogus values
            adc._isValidComparatorThreshold().should.be.exactly(false);
            adc._isValidComparatorThreshold('bogus').should.be.exactly(false);

            // real values
            adc._isValidComparatorThreshold(32767).should.be.exactly(true);
            adc._isValidComparatorThreshold(1).should.be.exactly(true);
            adc._isValidComparatorThreshold(0).should.be.exactly(true);
            adc._isValidComparatorThreshold(-1).should.be.exactly(true);
            adc._isValidComparatorThreshold(-32768).should.be.exactly(true);

            // outside threshold
            adc._isValidComparatorThreshold(32768).should.be.exactly(false);
            adc._isValidComparatorThreshold(-32769).should.be.exactly(false);

        });

    });

    describe('_getSPSTimeout', () => {

        it('should return a default timeout on ADS1015', function () {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            let sps = adc._getSPSTimeout(ADS1x15.spsADS1015.SPS_1600);
            sps.should.be.exactly(1.625); // 1000 / 1600 + 1 (default)
        });

        it('should return a default timeout on ADS1115', function () {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1115
            });

            let sps = adc._getSPSTimeout(ADS1x15.spsADS1115.SPS_250);
            sps.should.be.exactly(5); // 1000 / 250 + 1 (default)
        });

        it('should return a custom timeout on ADS1015', function () {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015,
                spsExtraDelay: 3
            });

            let sps = adc._getSPSTimeout(ADS1x15.spsADS1015.SPS_1600);
            sps.should.be.exactly(3.625); // 1000 / 1600 + 3 (custom)
        });

        it('should return a custom timeout on ADS1115', function () {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1115,
                spsExtraDelay: 3
            });

            let sps = adc._getSPSTimeout(ADS1x15.spsADS1115.SPS_250);
            sps.should.be.exactly(7); // 1000 / 250 + 3 (custom)
        });

    });

    describe('_convertADSValue', () => {

        it('should convert bytes on ADS1015', () => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc._convertADSValue(Buffer.from([0x7F, 0xF0])).should.be.exactly(2047);
            adc._convertADSValue(Buffer.from([0x00, 0x10])).should.be.exactly(1);
            adc._convertADSValue(Buffer.from([0x00, 0x00])).should.be.exactly(0);
            adc._convertADSValue(Buffer.from([0xff, 0xf0])).should.be.exactly(-1);
            adc._convertADSValue(Buffer.from([0x80, 0x00])).should.be.exactly(-2048);
        });

        it('should convert bytes on ADS1115', () => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1115
            });

            adc._convertADSValue(Buffer.from([0x7F, 0xFF])).should.be.exactly(32767);
            adc._convertADSValue(Buffer.from([0x00, 0x01])).should.be.exactly(1);
            adc._convertADSValue(Buffer.from([0x00, 0x00])).should.be.exactly(0);
            adc._convertADSValue(Buffer.from([0xff, 0xff])).should.be.exactly(-1);
            adc._convertADSValue(Buffer.from([0x80, 0x00])).should.be.exactly(-32768);
        });

    });

    describe('_convertMvValue', () => {

        it('should convert bytes on ADS1015', () => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc._convertVoltageValue(Buffer.from([0x7F, 0xF0]), ADS1x15.pga.PGA_4_096V).should.be.exactly(4.096);
            adc._convertVoltageValue(Buffer.from([0x00, 0x10]), ADS1x15.pga.PGA_4_096V).should.be.exactly(0.0020009770395701025);
            adc._convertVoltageValue(Buffer.from([0x00, 0x00]), ADS1x15.pga.PGA_4_096V).should.be.exactly(0);
            adc._convertVoltageValue(Buffer.from([0xFF, 0xF0]), ADS1x15.pga.PGA_4_096V).should.be.exactly(-0.002);
            adc._convertVoltageValue(Buffer.from([0x80, 0x00]), ADS1x15.pga.PGA_4_096V).should.be.exactly(-4.096);
        });

        it('should convert bytes on ADS1115', () => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1115
            });

            adc._convertVoltageValue(Buffer.from([0x7F, 0xFF]), ADS1x15.pga.PGA_4_096V).should.be.exactly(4.096);
            adc._convertVoltageValue(Buffer.from([0x00, 0x01]), ADS1x15.pga.PGA_4_096V).should.be.exactly(0.0001250038148136845);
            adc._convertVoltageValue(Buffer.from([0x00, 0x00]), ADS1x15.pga.PGA_4_096V).should.be.exactly(0);
            adc._convertVoltageValue(Buffer.from([0xFF, 0xFF]), ADS1x15.pga.PGA_4_096V).should.be.exactly(-0.000125);
            adc._convertVoltageValue(Buffer.from([0x80, 0x00]), ADS1x15.pga.PGA_4_096V).should.be.exactly(-4.096);
        });

    });

    describe('_writeConfigRegister', () => {

        it('should write the register', (done) => {

            let writeCompleted = false;
            const i2c = new FauxI2C({
                // I2C communication interception
                onWrite: (address, register, buffer, callback) => {

                    // Verify that the I2C packet is good
                    address.should.be.exactly(adc.address);
                    register.should.be.exactly(0x01);
                    buffer.length.should.be.exactly(2);
                    buffer[0].should.be.exactly(0x85);
                    buffer[1].should.be.exactly(0x83);
                    writeCompleted = true;

                    callback();
                }
            });

            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc._writeConfigRegister(0x8583, (err) => {
                should(err).not.be.ok();
                writeCompleted.should.be.exactly(true);
                done();
            });

        });

    });

    describe('_getThresholdValueBytes', () => {

        it('should covert threshold values for ADS1015', () => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc._getThresholdValueBytes(2047).should.containDeepOrdered([0x7F, 0xF0]);
            adc._getThresholdValueBytes(1).should.containDeepOrdered([0x00, 0x10]);
            adc._getThresholdValueBytes(0).should.containDeepOrdered([0x00, 0x00]);
            adc._getThresholdValueBytes(-1).should.containDeepOrdered([0xFF, 0xF0]);
            adc._getThresholdValueBytes(-2048).should.containDeepOrdered([0x80, 0x00]);
        });

        it('should covert threshold values for ADS1115', () => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1115
            });

            adc._getThresholdValueBytes(32767).should.containDeepOrdered([0x7F, 0xFF]);
            adc._getThresholdValueBytes(1).should.containDeepOrdered([0x00, 0x01]);
            adc._getThresholdValueBytes(0).should.containDeepOrdered([0x00, 0x00]);
            adc._getThresholdValueBytes(-1).should.containDeepOrdered([0xFF, 0xFF]);
            adc._getThresholdValueBytes(-32768).should.containDeepOrdered([0x80, 0x00]);
        });

    });

    describe('getThresholdFromVolts', () => {

        it('should use class pga if not given', () => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015,
                pga: ADS1x15.pga.PGA_2_048V
            });

            adc.getThresholdFromVolts(2.048).should.be.exactly(2047);
            adc.getThresholdFromVolts(1).should.be.exactly(999);
            adc.getThresholdFromVolts(0).should.be.exactly(0);
            adc.getThresholdFromVolts(-1).should.be.exactly(-1000);
            adc.getThresholdFromVolts(-2.048).should.be.exactly(-2048);
        });

        it('should convert values for ADS1015', () => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc.getThresholdFromVolts(2.048, ADS1x15.pga.PGA_2_048V).should.be.exactly(2047);
            adc.getThresholdFromVolts(1, ADS1x15.pga.PGA_2_048V).should.be.exactly(999);
            adc.getThresholdFromVolts(0, ADS1x15.pga.PGA_2_048V).should.be.exactly(0);
            adc.getThresholdFromVolts(-1, ADS1x15.pga.PGA_2_048V).should.be.exactly(-1000);
            adc.getThresholdFromVolts(-2.048, ADS1x15.pga.PGA_2_048V).should.be.exactly(-2048);
        });

        it('should convert values for ADS1115', () => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1115
            });

            adc.getThresholdFromVolts(2.048, ADS1x15.pga.PGA_2_048V).should.be.exactly(32767);
            adc.getThresholdFromVolts(1, ADS1x15.pga.PGA_2_048V).should.be.exactly(15999);
            adc.getThresholdFromVolts(0, ADS1x15.pga.PGA_2_048V).should.be.exactly(0);
            adc.getThresholdFromVolts(-1, ADS1x15.pga.PGA_2_048V).should.be.exactly(-16000);
            adc.getThresholdFromVolts(-2.048, ADS1x15.pga.PGA_2_048V).should.be.exactly(-32768);
        });

    });

    describe('_setComparatorThreshold', () => {

        it('should write the registers', (done) => {

            let highCompleted = false;
            let lowCompleted = false;
            const i2c = new FauxI2C({
                // I2C communication interception
                onWrite: (address, register, buffer, callback) => {

                    // Verify that the I2C packet is good
                    address.should.be.exactly(adc.address);
                    buffer.length.should.be.exactly(2);

                    if (register === 0x03) {
                        // high
                        buffer[0].should.be.exactly(0x7F);
                        buffer[1].should.be.exactly(0xF0);
                        highCompleted = true;
                    } else if (register === 0x02) {
                        // low
                        buffer[0].should.be.exactly(0x00);
                        buffer[1].should.be.exactly(0x10);
                        lowCompleted = true;
                    } else {
                        throw new Error('Unknown register value');
                    }

                    callback();
                }
            });

            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc._setComparatorThreshold(2047, 1, (err) => {
                should(err).not.be.ok();
                highCompleted.should.be.exactly(true);
                lowCompleted.should.be.exactly(true);
                done();
            });

        });

        // don't need to test the ADS1115 here cuz the underlying _getThresholdValueBytes is tested

    });

    describe('_getLastResult', () => {

        it('should read the conversion registers', (done) => {

            let readCompleted = false;
            const i2c = new FauxI2C({
                // I2C communication interception
                onRead: (address, register, length, callback) => {

                    // Verify that the I2C packet is good
                    address.should.be.exactly(adc.address);
                    register.should.be.exactly(0x00);
                    length.should.be.exactly(2);
                    readCompleted = true;

                    // return the max value
                    callback(null, Buffer.from([0x7F, 0xF0]));
                }
            });

            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc._getLastResult(ADS1x15.pga.PGA_4_096V, (err, value, volts) => {
                should(err).not.be.ok();

                readCompleted.should.be.exactly(true);
                value.should.be.exactly(2047);
                volts.should.be.exactly(4.096);

                done();

            });
        });

    });

    describe('_read', () => {

        it('execute a typical workflow', (done) => {
            let registerWriteCompleted = false;
            let readCompleted = false;
            const i2c = new FauxI2C({
                // I2C communication interception
                onWrite: (address, register, buffer, callback) => {
                    // Verify that the I2C packet is good
                    address.should.be.exactly(adc.address);
                    register.should.be.exactly(0x01); // config register
                    buffer.length.should.be.exactly(2); // don't care what it is for now
                    registerWriteCompleted = true;

                    callback(null);
                },
                onRead: (address, register, length, callback) => {
                    // Verify that the I2C packet is good
                    address.should.be.exactly(adc.address);
                    register.should.be.exactly(0x00); // conversion register
                    length.should.be.exactly(2);
                    readCompleted = true;

                    // return the max value
                    callback(null, Buffer.from([0x7F, 0xF0]));
                }
            });

            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc._read(null, {
                comparatorReadings: ADS1x15.comparatorReadings.DISABLED,
                comparatorLatchingMode: ADS1x15.comparatorLatchingMode.NON_LATCHING,
                comparatorActiveMode: ADS1x15.comparatorActiveMode.ACTIVE_LOW,
                mode: 0x0100,
                sps: ADS1x15.spsADS1015.SPS_250,
                pga: ADS1x15.pga.PGA_4_096V,
                mux: ADS1x15.channel.CHANNEL_0,

            }, (err, value, volts) => {
                should(err).not.be.ok();
                should(value).be.ok();
                should(volts).be.ok();

                registerWriteCompleted.should.be.exactly(true);
                readCompleted.should.be.exactly(true);

                value.should.be.exactly(2047);
                volts.should.be.exactly(4.096);

                done();

            });
        });

        it('should execute a validation and return an error', (done) => {
            let registerWriteCompleted = false;
            let readCompleted = false;
            let validationCompleted = false;

            const i2c = new FauxI2C({
                // I2C communication interception
                onWrite: (address, register, buffer, callback) => {
                    // Verify that the I2C packet is good
                    // SHOULD NOT BE CALLED
                    address.should.be.exactly(adc.address);
                    register.should.be.exactly(0x01); // config register
                    buffer.length.should.be.exactly(2); // don't care what it is for now
                    registerWriteCompleted = true;

                    callback(null);
                },
                onRead: (address, register, length, callback) => {
                    // Verify that the I2C packet is good
                    // SHOULD NOT BE CALLED
                    address.should.be.exactly(adc.address);
                    register.should.be.exactly(0x00); // conversion register
                    length.should.be.exactly(2);
                    readCompleted = true;

                    // return the max value
                    callback(null, Buffer.from([0x7F, 0xF0]));
                }
            });

            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            const validate = () => {
                validationCompleted = true;
                return new Error('Something is wrong');
            };


            adc._read(validate, {
                comparatorReadings: ADS1x15.comparatorReadings.DISABLED,
                comparatorLatchingMode: ADS1x15.comparatorLatchingMode.NON_LATCHING,
                comparatorActiveMode: ADS1x15.comparatorActiveMode.ACTIVE_LOW,
                mode: 0x0100,
                sps: ADS1x15.spsADS1015.SPS_250,
                pga: ADS1x15.pga.PGA_4_096V,
                mux: ADS1x15.channel.CHANNEL_0,

            }, (err, value, volts) => {
                should(err).be.ok();
                should(value).be.exactly(null);
                should(volts).be.exactly(null);

                validationCompleted.should.be.exactly(true);
                registerWriteCompleted.should.be.exactly(false);
                readCompleted.should.be.exactly(false);

                done();

            });
        });

        it('should update _lastContinuousPGA when in continuous mode', (done) => {
            let registerWriteCompleted = false;
            let readCompleted = false;

            const i2c = new FauxI2C({
                // I2C communication interception
                onWrite: (address, register, buffer, callback) => {
                    // Verify that the I2C packet is good
                    address.should.be.exactly(adc.address);
                    register.should.be.exactly(0x01); // config register
                    buffer.length.should.be.exactly(2); // don't care what it is for now
                    registerWriteCompleted = true;

                    callback(null);
                },
                onRead: (address, register, length, callback) => {
                    // Verify that the I2C packet is good
                    address.should.be.exactly(adc.address);
                    register.should.be.exactly(0x00); // conversion register
                    length.should.be.exactly(2);
                    readCompleted = true;

                    // return the max value
                    callback(null, Buffer.from([0x7F, 0xF0]));
                }
            });

            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015,
                pga: ADS1x15.pga.PGA_2_048V // set this to something different than our _read
            });

            // This should be set in the constructor
            adc._lastContinuousPGA.should.be.exactly(ADS1x15.pga.PGA_2_048V);

            adc._read(null, {
                comparatorReadings: ADS1x15.comparatorReadings.DISABLED,
                comparatorLatchingMode: ADS1x15.comparatorLatchingMode.NON_LATCHING,
                comparatorActiveMode: ADS1x15.comparatorActiveMode.ACTIVE_LOW,
                mode: 0x0000, // continuous mode
                sps: ADS1x15.spsADS1015.SPS_250,
                pga: ADS1x15.pga.PGA_4_096V,
                mux: ADS1x15.channel.CHANNEL_0,

            }, (err, value, volts) => {
                should(err).not.be.ok();
                should(value).be.ok();
                should(volts).be.ok();

                registerWriteCompleted.should.be.exactly(true);
                readCompleted.should.be.exactly(true);

                value.should.be.exactly(2047);
                volts.should.be.exactly(4.096);

                // verify that _lastContinuousPGA was updated
                adc._lastContinuousPGA.should.be.exactly(ADS1x15.pga.PGA_4_096V);

                done();

            });
        });

        it('should set comparator threshold when in using the comparator', (done) => {
            let registerWriteCompleted = false;
            let readCompleted = false;
            let highCompleted = false;
            let lowCompleted = false;

            const i2c = new FauxI2C({
                // I2C communication interception
                onWrite: (address, register, buffer, callback) => {
                    // Verify that the I2C packet is good
                    address.should.be.exactly(adc.address);
                    buffer.length.should.be.exactly(2); // don't care what it is for now

                    if (register === 0x01) {
                        registerWriteCompleted = true;
                    } else if (register === 0x03) {
                        // high
                        buffer[0].should.be.exactly(0x7F);
                        buffer[1].should.be.exactly(0xF0);
                        highCompleted = true;
                    } else if (register === 0x02) {
                        // low
                        buffer[0].should.be.exactly(0x00);
                        buffer[1].should.be.exactly(0x10);
                        lowCompleted = true;
                    } else {
                        throw new Error('Unknown register value');
                    }

                    callback(null);
                },
                onRead: (address, register, length, callback) => {
                    // Verify that the I2C packet is good
                    address.should.be.exactly(adc.address);
                    register.should.be.exactly(0x00); // conversion register
                    length.should.be.exactly(2);
                    readCompleted = true;

                    // return the max value
                    callback(null, Buffer.from([0x7F, 0xF0]));
                }
            });

            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015,
            });

            adc._read(null, {
                comparatorReadings: ADS1x15.comparatorReadings.READINGS_1,
                comparatorLatchingMode: ADS1x15.comparatorLatchingMode.NON_LATCHING,
                comparatorActiveMode: ADS1x15.comparatorActiveMode.ACTIVE_LOW,
                sps: ADS1x15.spsADS1015.SPS_250,
                pga: ADS1x15.pga.PGA_4_096V,
                mux: ADS1x15.channel.CHANNEL_0,
                lowThreshold: 1,
                highThreshold: 2047

            }, (err, value, volts) => {
                should(err).not.be.ok();
                should(value).be.ok();
                should(volts).be.ok();

                registerWriteCompleted.should.be.exactly(true);
                readCompleted.should.be.exactly(true);
                highCompleted.should.be.exactly(true);
                lowCompleted.should.be.exactly(true);

                value.should.be.exactly(2047);
                volts.should.be.exactly(4.096);

                done();

            });
        });

    });

    describe('_validateThenRead', () => {

        it('should pass a typical workflow', (done) => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc._validateThenRead({
                isDifferential: false,
                isComparative: false,
                mode: 0x0100,
                mux: ADS1x15.channel.CHANNEL_0,

            }, (err, value, volts) => {
                should(err).not.be.ok();

                // default faux i2c instance returns zero
                value.should.be.exactly(0);
                volts.should.be.exactly(0);

                done();

            });
        });

        it('should reject invalid sps', (done) => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc._validateThenRead({
                isDifferential: false,
                isComparative: false,
                mode: 0x0100,
                mux: ADS1x15.channel.CHANNEL_0,

                sps: -1

            }, (err, value, volts) => {
                should(err).be.ok();
                err.message.should.match(/sps/);

                should(value).not.be.ok();
                should(volts).not.be.ok();

                done();

            });
        });

        it('should reject invalid pga', (done) => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc._validateThenRead({
                isDifferential: false,
                isComparative: false,
                mode: 0x0100,
                mux: ADS1x15.channel.CHANNEL_0,

                pga: -1

            }, (err, value, volts) => {
                should(err).be.ok();
                err.message.should.match(/pga/);

                should(value).not.be.ok();
                should(volts).not.be.ok();

                done();

            });
        });

        it('should reject invalid channel', (done) => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc._validateThenRead({
                isDifferential: false,
                isComparative: false,
                mode: 0x0100,

                mux: -1,

            }, (err, value, volts) => {
                should(err).be.ok();
                err.message.should.match(/channel/);

                should(value).not.be.ok();
                should(volts).not.be.ok();

                done();

            });
        });

        it('should reject invalid differential', (done) => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc._validateThenRead({
                isDifferential: true,
                isComparative: false,
                mode: 0x0100,

                mux: -1

            }, (err, value, volts) => {
                should(err).be.ok();
                err.message.should.match(/differential/);

                should(value).not.be.ok();
                should(volts).not.be.ok();

                done();

            });
        });

        it('should reject invalid comparator readings count', (done) => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc._validateThenRead({
                isDifferential: false,
                isComparative: true,
                mode: 0x0100,
                mux: ADS1x15.channel.CHANNEL_0,

                comparatorReadings: -1

            }, (err, value, volts) => {
                should(err).be.ok();
                err.message.should.match(/readings/);

                should(value).not.be.ok();
                should(volts).not.be.ok();

                done();

            });
        });

        it('should reject invalid comparator latching mode', (done) => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc._validateThenRead({
                isDifferential: false,
                isComparative: true,
                mode: 0x0100,
                mux: ADS1x15.channel.CHANNEL_0,

                comparatorLatchingMode: -1

            }, (err, value, volts) => {
                should(err).be.ok();
                err.message.should.match(/latching/);

                should(value).not.be.ok();
                should(volts).not.be.ok();

                done();

            });
        });

        it('should reject invalid comparator active mode', (done) => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc._validateThenRead({
                isDifferential: false,
                isComparative: true,
                mode: 0x0100,
                mux: ADS1x15.channel.CHANNEL_0,

                comparatorActiveMode: -1

            }, (err, value, volts) => {
                should(err).be.ok();
                err.message.should.match(/active/);

                should(value).not.be.ok();
                should(volts).not.be.ok();

                done();

            });
        });

        it('should reject invalid comparator mode', (done) => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc._validateThenRead({
                isDifferential: false,
                isComparative: true,
                mode: 0x0100,
                mux: ADS1x15.channel.CHANNEL_0,

                comparatorMode: -1

            }, (err, value, volts) => {
                should(err).be.ok();
                err.message.should.match(/comparator mode/);

                should(value).not.be.ok();
                should(volts).not.be.ok();

                done();

            });
        });

        it('should reject invalid comparator low threshold', (done) => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc._validateThenRead({
                isDifferential: false,
                isComparative: true,
                mode: 0x0100,
                mux: ADS1x15.channel.CHANNEL_0,

                lowThreshold: -2049

            }, (err, value, volts) => {
                should(err).be.ok();
                err.message.should.match(/low threshold/);

                should(value).not.be.ok();
                should(volts).not.be.ok();

                done();

            });
        });

        it('should reject invalid comparator high threshold', (done) => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc._validateThenRead({
                isDifferential: false,
                isComparative: true,
                mode: 0x0100,
                mux: ADS1x15.channel.CHANNEL_0,

                highThreshold: 2048

            }, (err, value, volts) => {
                should(err).be.ok();
                err.message.should.match(/high threshold/);

                should(value).not.be.ok();
                should(volts).not.be.ok();

                done();

            });
        });

    });

    describe('readChannel', () => {

        it('should not need options', (done) => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc.readChannel(ADS1x15.channel.CHANNEL_0, (err, value, volts) => {
                should(err).not.be.ok();
                value.should.be.exactly(0);
                volts.should.be.exactly(0);

                done();
            });
        });

        it('should accept options', (done) => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc.readChannel(ADS1x15.channel.CHANNEL_0, {
                sps: ADS1x15.spsADS1015.SPS_250
            }, (err, value, volts) => {
                should(err).not.be.ok();
                value.should.be.exactly(0);
                volts.should.be.exactly(0);

                done();
            });
        });

    });

    describe('readDifferential', () => {

        it('should not need options', (done) => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc.readDifferential(ADS1x15.differential.DIFF_0_1, (err, value, volts) => {
                should(err).not.be.ok();
                value.should.be.exactly(0);
                volts.should.be.exactly(0);

                done();
            });
        });

        it('should accept options', (done) => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc.readDifferential(ADS1x15.differential.DIFF_0_1, {
                sps: ADS1x15.spsADS1015.SPS_250
            }, (err, value, volts) => {
                should(err).not.be.ok();
                value.should.be.exactly(0);
                volts.should.be.exactly(0);

                done();
            });
        });

    });

    describe('startContinuousChannel', () => {

        it('should not need options', (done) => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc.startContinuousChannel(ADS1x15.channel.CHANNEL_0, (err, value, volts) => {
                should(err).not.be.ok();
                value.should.be.exactly(0);
                volts.should.be.exactly(0);

                done();
            });
        });

        it('should accept options', (done) => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc.startContinuousChannel(ADS1x15.channel.CHANNEL_0, {
                sps: ADS1x15.spsADS1015.SPS_250
            }, (err, value, volts) => {
                should(err).not.be.ok();
                value.should.be.exactly(0);
                volts.should.be.exactly(0);

                done();
            });
        });

    });

    describe('startContinuousDifferential', () => {

        it('should not need options', (done) => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc.startContinuousDifferential(ADS1x15.differential.DIFF_0_1, (err, value, volts) => {
                should(err).not.be.ok();
                value.should.be.exactly(0);
                volts.should.be.exactly(0);

                done();
            });
        });

        it('should accept options', (done) => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc.startContinuousDifferential(ADS1x15.differential.DIFF_0_1, {
                sps: ADS1x15.spsADS1015.SPS_250
            }, (err, value, volts) => {
                should(err).not.be.ok();
                value.should.be.exactly(0);
                volts.should.be.exactly(0);

                done();
            });
        });

    });

    describe('startComparatorChannel', () => {

        it('should not need options', (done) => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc.startComparatorChannel(ADS1x15.channel.CHANNEL_0, 100, 10, (err, value, volts) => {
                should(err).not.be.ok();
                value.should.be.exactly(0);
                volts.should.be.exactly(0);

                done();
            });
        });

        it('should accept options', (done) => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc.startComparatorChannel(ADS1x15.channel.CHANNEL_0, 100, 10, {
                sps: ADS1x15.spsADS1015.SPS_250
            }, (err, value, volts) => {
                should(err).not.be.ok();
                value.should.be.exactly(0);
                volts.should.be.exactly(0);

                done();
            });
        });

    });

    describe('startComparatorDifferential', () => {

        it('should not need options', (done) => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc.startComparatorDifferential(ADS1x15.differential.DIFF_0_1, 100, 10, (err, value, volts) => {
                should(err).not.be.ok();
                value.should.be.exactly(0);
                volts.should.be.exactly(0);

                done();
            });
        });

        it('should accept options', (done) => {
            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc.startComparatorDifferential(ADS1x15.differential.DIFF_0_1, 100, 10, {
                sps: ADS1x15.spsADS1015.SPS_250
            }, (err, value, volts) => {
                should(err).not.be.ok();
                value.should.be.exactly(0);
                volts.should.be.exactly(0);

                done();
            });
        });

    });

    describe('getLastReading', () => {

        it('should get the last reading', (done) => {
            let readCompleted = false;
            const i2c = new FauxI2C({
                // I2C communication interception
                onRead: (address, register, length, callback) => {

                    // Verify that the I2C packet is good
                    address.should.be.exactly(adc.address);
                    register.should.be.exactly(0x00);
                    length.should.be.exactly(2);
                    readCompleted = true;

                    // return the max value
                    callback(null, Buffer.from([0x7F, 0xF0]));
                }
            });

            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015,
                pga: ADS1x15.pga.PGA_4_096V
            });

            adc.getLastReading((err, value, volts) => {
                should(err).not.be.ok();

                readCompleted.should.be.exactly(true);
                value.should.be.exactly(2047);
                volts.should.be.exactly(4.096);

                done();

            });
        });

    });

    describe('stopContinuousReading', () => {

        it('should reset the config register', (done) => {
            let writeCompleted = false;
            const i2c = new FauxI2C({
                // I2C communication interception
                onWrite: (address, register, buffer, callback) => {

                    // Verify that the I2C packet is good
                    address.should.be.exactly(adc.address);
                    register.should.be.exactly(0x01);
                    buffer.length.should.be.exactly(2);
                    buffer[0].should.be.exactly(0x85);
                    buffer[1].should.be.exactly(0x83);
                    writeCompleted = true;

                    callback();
                }
            });

            const adc = new ADS1x15({
                i2c,
                chip: ADS1x15.chips.IC_ADS1015
            });

            adc.stopContinuousReadings((err) => {
                should(err).not.be.ok();
                writeCompleted.should.be.exactly(true);
                done();
            });

        });

    });

});