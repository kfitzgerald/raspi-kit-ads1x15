"use strict";

const Async = require('async');

//region Internal Constants

// Pointer Register
const ADS1015_REG_POINTER_CONVERT = 0x00;
const ADS1015_REG_POINTER_CONFIG = 0x01;
const ADS1015_REG_POINTER_LOWTHRESH = 0x02;
const ADS1015_REG_POINTER_HITHRESH = 0x03;

// Config Register
const ADS1015_REG_CONFIG_OS_SINGLE = 0x8000;    // Write: Set to start a single-conversion
// noinspection JSUnusedLocalSymbols
const ADS1015_REG_CONFIG_OS_BUSY = 0x0000;      // Read: Bit = 0 when conversion is in progress
// noinspection JSUnusedLocalSymbols
const ADS1015_REG_CONFIG_OS_NOTBUSY = 0x8000;   // Read: Bit = 1 when device is not performing a conversion

const ADS1015_REG_CONFIG_MUX_DIFF_0_1 = 0x0000; // Differential P = AIN0, N = AIN1 (default)
const ADS1015_REG_CONFIG_MUX_DIFF_0_3 = 0x1000; // Differential P = AIN0, N = AIN3
const ADS1015_REG_CONFIG_MUX_DIFF_1_3 = 0x2000; // Differential P = AIN1, N = AIN3
const ADS1015_REG_CONFIG_MUX_DIFF_2_3 = 0x3000; // Differential P = AIN2, N = AIN3

const ADS1015_REG_CONFIG_MUX_SINGLE_0 = 0x4000; // Single-ended AIN0
const ADS1015_REG_CONFIG_MUX_SINGLE_1 = 0x5000; // Single-ended AIN1
const ADS1015_REG_CONFIG_MUX_SINGLE_2 = 0x6000; // Single-ended AIN2
const ADS1015_REG_CONFIG_MUX_SINGLE_3 = 0x7000; // Single-ended AIN3

const ADS1015_REG_CONFIG_PGA_6_144V = 0x0000; // +/-6.144V range
const ADS1015_REG_CONFIG_PGA_4_096V = 0x0200; // +/-4.096V range
const ADS1015_REG_CONFIG_PGA_2_048V = 0x0400; // +/-2.048V range (default)
const ADS1015_REG_CONFIG_PGA_1_024V = 0x0600; // +/-1.024V range
const ADS1015_REG_CONFIG_PGA_0_512V = 0x0800; // +/-0.512V range
const ADS1015_REG_CONFIG_PGA_0_256V = 0x0A00; // +/-0.256V range

const ADS1015_REG_CONFIG_MODE_CONTIN = 0x0000; // Continuous conversion mode
const ADS1015_REG_CONFIG_MODE_SINGLE = 0x0100; // Power-down single-shot mode (default)

const ADS1015_REG_CONFIG_DR_128SPS = 0x0000; // 128 samples per second
const ADS1015_REG_CONFIG_DR_250SPS = 0x0020; // 250 samples per second
const ADS1015_REG_CONFIG_DR_490SPS = 0x0040; // 490 samples per second
const ADS1015_REG_CONFIG_DR_920SPS = 0x0060; // 920 samples per second
const ADS1015_REG_CONFIG_DR_1600SPS = 0x0080; // 1600 samples per second (default)
const ADS1015_REG_CONFIG_DR_2400SPS = 0x00A0; // 2400 samples per second
const ADS1015_REG_CONFIG_DR_3300SPS = 0x00C0; // 3300 samples per second (also 0x00E0)

const ADS1115_REG_CONFIG_DR_8SPS = 0x0000; // 8 samples per second
const ADS1115_REG_CONFIG_DR_16SPS = 0x0020; // 16 samples per second
const ADS1115_REG_CONFIG_DR_32SPS = 0x0040; // 32 samples per second
const ADS1115_REG_CONFIG_DR_64SPS = 0x0060; // 64 samples per second
const ADS1115_REG_CONFIG_DR_128SPS = 0x0080; // 128 samples per second
const ADS1115_REG_CONFIG_DR_250SPS = 0x00A0; // 250 samples per second (default)
const ADS1115_REG_CONFIG_DR_475SPS = 0x00C0; // 475 samples per second
const ADS1115_REG_CONFIG_DR_860SPS = 0x00E0; // 860 samples per second

const ADS1015_REG_CONFIG_CMODE_TRAD = 0x0000; // Traditional comparator with hysteresis (default)
const ADS1015_REG_CONFIG_CMODE_WINDOW = 0x0010; // Window comparator

const ADS1015_REG_CONFIG_CPOL_ACTVLOW = 0x0000; // ALERT/RDY pin is low when active (default)
const ADS1015_REG_CONFIG_CPOL_ACTVHI = 0x0008; // ALERT/RDY pin is high when active

const ADS1015_REG_CONFIG_CLAT_NONLAT = 0x0000; // Non-latching comparator (default)
const ADS1015_REG_CONFIG_CLAT_LATCH = 0x0004; // Latching comparator

const ADS1015_REG_CONFIG_CQUE_1CONV = 0x0000; // Assert ALERT/RDY after one conversions
const ADS1015_REG_CONFIG_CQUE_2CONV = 0x0001; // Assert ALERT/RDY after two conversions
const ADS1015_REG_CONFIG_CQUE_4CONV = 0x0002; // Assert ALERT/RDY after four conversions
const ADS1015_REG_CONFIG_CQUE_NONE = 0x0003; // Disable the comparator and put ALERT/RDY in high state (default)

const ADS1015_REG_CONFIG_DEFAULT = 0x8583;  // Stop/Reset continuous readings



//endregion

/**
 * ADS1x15 chip series interface class
 */
class ADS1x15 {

    // noinspection JSValidateJSDoc
    /**
     * Creates a new instance of the ADS1x15 interface
     * @param {{i2c:*, chip:number, address:number, pga:number, sps:number, spsExtraDelay:number}} [options] – ADS configuration options
     */
    constructor(options) {

        /* istanbul ignore next: otherwise unit testing would fail on non raspi devices */
        options = options || {};

        /* istanbul ignore next: otherwise unit testing would fail on non raspi devices */
        // noinspection JSValidateJSDoc
        /**
         * Raspi-I2C class instance
         * @type {I2C}
         */
        this.i2c = options.i2c || this._getI2CInterface();

        /**
         * Chip version to use. Defaults to ADS1115.
         * @type {number}
         */
        this.chip = typeof options.chip === "number" ? options.chip : ADS1x15.chips.IC_ADS1115;
        if (typeof options.chip !== 'number') {
            console.warn('ADS1x15: Warning: No ADS chip specified, assuming ADS1115...');
        }

        /**
         * Chip I2C address. Defaults to 0x48.
         * @type {number}
         */
        this.address = typeof options.address === "number" ? options.address : ADS1x15.address.ADDRESS_0x48;

        /**
         * Default Power Gain Amplifier value to use for readings. Defaults to +/-2.048V
         * @type {number}
         */
        this.pga = typeof options.pga === "number" ? options.pga : ADS1x15.pga.PGA_2_048V;

        /**
         * Default Samples per second value to use for readings. Defaults to chip defaults.
         * @type {number}
         */
        this.sps = typeof options.sps === "number" ? options.sps : this._getDefaultSPS();

        /**
         * Padding time to wait when expecting the chip wait (in milliseconds). Defaults to 1ms
         * @type {number}
         */
        this.spsExtraDelay = typeof options.spsExtraDelay === "number" ? options.spsExtraDelay : 1;

        /**
         * The last set PGA value used when starting a continuous conversion
         * @type {number|{PGA_6_144V: number, PGA_4_096V: number, PGA_2_048V: number, PGA_1_024V: number, PGA_0_512V: number, PGA_0_256V: number}}
         * @private
         */
        this._lastContinuousPGA = this.pga;
    }

    /* istanbul ignore next: otherwise unit testing would fail on non raspi devices */
    // noinspection JSMethodCanBeStatic
    /**
     * Gets the default interface class to I2C
     * @return {*}
     * @private
     */
    _getI2CInterface() {
        // noinspection NpmUsedModulesInstalled
        const I2C = require('raspi-i2c').I2C;
        return new I2C();
    }

    /**
     * Gets the default samples per second to use, based on the configured chip
     * @return {number}
     * @private
     */
    _getDefaultSPS() {
        if (this.chip === ADS1x15.chips.IC_ADS1115) {
            return ADS1x15.spsADS1115.SPS_250;
        } else {
            return ADS1x15.spsADS1015.SPS_1600;
        }
    }

    /**
     * Verifies that the given channel is valid for this chip
     * @param {number} channel
     * @return {boolean}
     * @private
     */
    _isValidChannel(channel) {
        return Object.keys(ADS1x15.channel)
            .map((k) => ADS1x15.channel[k])
            .indexOf(channel) >= 0;
    }

    /**
     * Verifies that the given differential comparator is valid for this chip
     * @param {number} differential
     * @return {boolean}
     * @private
     */
    _isValidDifferential(differential) {
        return Object.keys(ADS1x15.differential)
            .map((k) => ADS1x15.differential[k])
            .indexOf(differential) >= 0;
    }

    /**
     * Verifies that the given samples per second value is valid for this chip
     * @param {number} sps
     * @return {boolean}
     * @private
     */
    _isValidSPS(sps) {
        const chipSPSs = this.chip === ADS1x15.chips.IC_ADS1115 ? ADS1x15.spsADS1115 : ADS1x15.spsADS1015;
        return Object.keys(chipSPSs)
            .map((k) => chipSPSs[k])
            .indexOf(sps) >= 0;
    }

    /**
     * Verifies that the given power-gain-amplifier value is valid for this chip
     * @param {number} pga
     * @return {boolean}
     * @private
     */
    _isValidPGA(pga) {
        return Object.keys(ADS1x15.pga)
            .map((k) => ADS1x15.pga[k])
            .indexOf(pga) >= 0;
    }

    _isValidComparatorActiveMode(mode) {
        return Object.keys(ADS1x15.comparatorActiveMode)
            .map((k) => ADS1x15.comparatorActiveMode[k])
            .indexOf(mode) >= 0;
    }

    _isValidComparatorMode(mode) {
        return Object.keys(ADS1x15.comparatorMode)
            .map((k) => ADS1x15.comparatorMode[k])
            .indexOf(mode) >= 0;
    }

    _isValidComparatorLatchingMode(mode) {
        return Object.keys(ADS1x15.comparatorLatchingMode)
            .map((k) => ADS1x15.comparatorLatchingMode[k])
            .indexOf(mode) >= 0;
    }

    _isValidComparatorReadingsCount(count) {
        return Object.keys(ADS1x15.comparatorReadings)
            .map((k) => ADS1x15.comparatorReadings[k])
            .indexOf(count) >= 0;
    }

    _isValidComparatorThreshold(value) {
        const max = this.chip === ADS1x15.chips.IC_ADS1015 ? ADS1x15.thresholdMaxValues.ADS1015_MAX_RANGE : ADS1x15.thresholdMaxValues.ADS1115_MAX_RANGE;
        return typeof (value === "number") && (value >= (-1 * max)) && (value <= (max-1)); // between -max and +(max-1) for the chip
    }

    // noinspection JSMethodCanBeStatic
    /**
     * Gets the node setTimeout value to use when waiting on the chip
     * @param {number} sps
     * @return {number}
     * @private
     */
    _getSPSTimeout(sps) {
        if (this.chip === ADS1x15.chips.IC_ADS1015) {
            return ADS1x15.spsToMilliseconds.ADS1015[sps] + this.spsExtraDelay;
        } else {
            return ADS1x15.spsToMilliseconds.ADS1115[sps] + this.spsExtraDelay;
        }
    }

    /**
     * Converts the bits returned from the ADC chip to a raw numerical 12-bit (ADS1015) or 16-bit (ADS1115) value
     * @param {array} bytes
     * @return {number}
     * @private
     */
    _convertADSValue(bytes) {
        if (this.chip === ADS1x15.chips.IC_ADS1015) {
            let value = ((bytes[0] & 0xff) << 4) | ((bytes[1] & 0xff) >> 4);
            if ((value & 0x800) !== 0) {
                value -= 1 << 12;
            }
            return value;
        } else {
            let value = ((bytes[0] & 0xff) << 8) | ((bytes[1] & 0xff));
            if ((value & 0x8000) !== 0) {
                value -= 1 << 16;
            }
            return value;
        }
    }

    /**
     * Converts the bits returned from the ADC chip to Volts (V) reading
     * @param {array} bytes – Output bytes from ADC chip
     * @param {number} pga – PGA value used for the reading
     * @return {number} – Value in Volts (V)
     * @private
     */
    _convertVoltageValue(bytes, pga) {
        const value = this._convertADSValue(bytes);
        return this.getVoltageFromValue(value, pga);
    }

    /**
     * Converts the ADC reading value to Volts (V)
     * @param {number} value – ADC reading
     * @param {number} pga – PGA in use at time of reading
     * @return {number} – Reading value in Volts
     */
    getVoltageFromValue(value, pga) {
        let max;

        // positive values must be 1 less than max range value (e.g. full scale of 12 bit ADC => 2^(12-1)-1 => -2048 to 2047)
        if (this.chip === ADS1x15.chips.IC_ADS1015) {
            max = value > 0 ? ADS1x15.thresholdMaxValues.ADS1015_MAX_RANGE - 1 : ADS1x15.thresholdMaxValues.ADS1015_MAX_RANGE;
        } else {
            max = value > 0 ? ADS1x15.thresholdMaxValues.ADS1115_MAX_RANGE - 1 : ADS1x15.thresholdMaxValues.ADS1115_MAX_RANGE;
        }
        return value / max * ADS1x15.pgaToVolts[pga]; // value / mx = % of scale, scale * pga = Volts
    }

    /**
     * Performs the process flow to do a single-shot, continuous or comparative reading
     * @param {function} [validate] – Optional validation function to perform before executing the command. Set to null to skip.
     * @param {{comparatorReadings:number, comparatorLatchingMode:number, comparatorActiveMode:number, comparatorMode:number, mode:number, sps:number, pga:number, mux:number, highThreshold:number, lowThreshold:number}} options - configuration options
     * @param {function(err:Error, value:number, volts:number)} callback – Fired whe completed
     * @private
     */
    _read(validate, options, callback) {
        Async.waterfall([

            // Do the validation
            (next) => {
                let err = null;
                if (validate) err = validate();
                next(err);
            },

            // Setup the config register
            (next) => {
                // Initialize the config
                let config  = options.comparatorReadings        // Set comparator readings (or disable)
                    | options.comparatorLatchingMode    // Set latching mode
                    | options.comparatorActiveMode      // Set active/ready mode
                    | options.comparatorMode            // Set comparator mode
                    | options.mode                      // Set operation mode (single, continuous)
                    | options.sps                       // Set sample per seconds
                    | options.pga                       // Set PGA/voltage range
                    | options.mux                       // Set mux (channel or differential bit)
                    | ADS1015_REG_CONFIG_OS_SINGLE      // Set 'start single-conversion' bit
                ;

                // Store pga for future readings
                if (options.mode === ADS1015_REG_CONFIG_MODE_CONTIN) {
                    this._lastContinuousPGA = options.pga;
                }

                next(null, config);
            },

            // For comparator mode, set the low and high register values
            (config, next) => {
                if (options.comparatorReadings !== ADS1x15.comparatorReadings.DISABLED) {
                    this._setComparatorThreshold(options.highThreshold, options.lowThreshold, (err) => next(err, config));
                } else {
                    next(null, config);
                }
            },

            // Write config register to ADC
            (config, next) => {
                this._writeConfigRegister(config, next);
            },

            // Wait for the ADC conversion to complete (based on SPS)
            (next) => {
                setTimeout(() => next(), this._getSPSTimeout(options.sps));
            },

            // Read the conversion results
            (next) => {
                this._getLastResult(options.pga, next);
            }

        ], (err, value = null, volts = null) => {
            callback(err, value, volts);
        });
    }

    /**
     * Writes the configuration register to the ADS chip
     * @param {number} config – Configuration bytes
     * @param {function(err:Error?)} callback – Fired when completed
     * @private
     */
    _writeConfigRegister(config, callback) {
        const bytes = [(config >> 8) & 0xFF, config & 0xFF];
        this.i2c.write(this.address, ADS1015_REG_POINTER_CONFIG, Buffer.from(bytes), (err) => {
            /* istanbul ignore if: i2c communication issues out of scope */
            if (err) {
                callback(new Error('Failed to write config register to ADS1x15:' + err.toString()));
            } else {
                callback();
            }
        });
    }

    /**
     * Format the given value as a 16-bit signed-int in two's compliment
     * @param {number} value
     * @return {[number, number]}
     * @private
     */
    _getThresholdValueBytes(value) {
        // ADS1015 is a 12-bit ADC, but thresholds are 16-bit, first 4-bits are unused.
        if (this.chip === ADS1x15.chips.IC_ADS1015) {
            value = value << 4; // shift over by 4 cuz the first 4 bits are reserved (uses bits 15-4, 3-0 reserved)
        }
        return [(value >> 8) & 0xFF, value & 0xFF];
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Gets the threshold value for comparators from given Volts and PGA enumeration
     * @param {number} volts - Number of Volts the threshold should trigger
     * @param {number} [pga] – ADS1x15.pga enumeration to use, if none given the class default is used
     * @return {number}
     */
    getThresholdFromVolts(volts, pga) {
        if (typeof pga !== "number") pga = this.pga;
        let max = this.chip === ADS1x15.chips.IC_ADS1015 ? ADS1x15.thresholdMaxValues.ADS1015_MAX_RANGE : ADS1x15.thresholdMaxValues.ADS1115_MAX_RANGE;
        if (volts > 0) max -= 1; // positive range is 0 to max-1, negative range is -max to 0
        return Math.floor(volts * (max / ADS1x15.pgaToVolts[pga]));
    }

    /**
     * Writes the comparator threshold values to the registers on the ADS chip
     * @param {number} high – 12bit (ADS1015) or 16bit (ADS1115) signed integer
     * @param {number} low – 12bit (ADS1015) or 16bit (ADS1115) signed integer
     * @param {function(err:Error)} callback
     * @private
     */
    _setComparatorThreshold(high, low, callback) {
        Async.series([

            // Set high threshold
            (next) => {
                const bytes = this._getThresholdValueBytes(high);
                this.i2c.write(this.address, ADS1015_REG_POINTER_HITHRESH, Buffer.from(bytes), (err) => {
                    /* istanbul ignore if: i2c communication issues out of scope */
                    if (err) {
                        next(new Error('Failed to write high threshold register to ADS1x15:' + err.toString()));
                    } else {
                        next();
                    }
                });
            },

            // Set low threshold
            (next) => {
                const bytes = this._getThresholdValueBytes(low);
                this.i2c.write(this.address, ADS1015_REG_POINTER_LOWTHRESH, Buffer.from(bytes), (err) => {
                    /* istanbul ignore if: i2c communication issues out of scope */
                    if (err) {
                        next(new Error('Failed to write low threshold register to ADS1x15:' + err.toString()));
                    } else {
                        next();
                    }
                });
            }

        ], callback);
    }

    /**
     * Gets the last reading available from the chip
     * @param {number} pga – PGA to use for Volts conversion
     * @param {function(err:Error, value:number, volts:number)} callback
     * @private
     */
    _getLastResult(pga, callback) {
        this.i2c.read(this.address, ADS1015_REG_POINTER_CONVERT, 2, (err, bytes) => {
            /* istanbul ignore if: i2c communication issues out of scope */
            if (err) {
                // noinspection JSCheckFunctionSignatures
                callback(new Error('Failed to read data: ' + err.toString()));
            } else {
                callback(null, this._convertADSValue(bytes), this._convertVoltageValue(bytes, pga));
            }
        });
    }

    /**
     * Performs validation and executes the reading
     * @param {{sps:number, pga:number, mux:number, mode:number, isDifferential:boolean, isComparative:boolean, [comparatorReadings]:number, [comparatorLatchingMode]:number, [comparatorActiveMode]:number, [comparatorMode]:number, [lowThreshold]:number, [highThreshold]:number}} [options] – Optional Power-gain-amplifier value to use. Defaults to class-set PGA value.
     * @param {function(err:Error, value:number, volts:number)} callback
     * @private
     */
    _validateThenRead(options, callback) {

        // Set defaults
        let sps = this.sps;    // Local SPS
        let pga = this.pga;    // Local PGA
        let comparatorReadings = ADS1x15.comparatorReadings.DISABLED;               // Disable comparator
        let comparatorLatchingMode = ADS1x15.comparatorLatchingMode.NON_LATCHING;   // Non-latching
        let comparatorActiveMode = ADS1x15.comparatorActiveMode.ACTIVE_LOW;         // Alert/Rdy active low
        let comparatorMode = ADS1x15.comparatorMode.TRADITIONAL;                   // traditional comparator
        let lowThreshold = 0;
        let highThreshold = 0;

        let isDifferential = options.isDifferential === true;
        let isComparative = options.isComparative === true;
        let mux = options.mux;
        let mode = options.mode;

        // Use option-provided values, if specified
        if (typeof options.sps === "number") sps = options.sps;
        if (typeof options.pga === "number") pga = options.pga;

        // Set comparative options if operating in that mode
        if (isComparative) {
            comparatorReadings = ADS1x15.comparatorReadings.READINGS_1; // Default 1 reading
            if (typeof options.comparatorReadings === "number") comparatorReadings = options.comparatorReadings;
            if (typeof options.comparatorLatchingMode === "number") comparatorLatchingMode = options.comparatorLatchingMode;
            if (typeof options.comparatorActiveMode === "number") comparatorActiveMode = options.comparatorActiveMode;
            if (typeof options.comparatorMode === "number") comparatorMode = options.comparatorMode;
            if (typeof options.lowThreshold === "number") lowThreshold = options.lowThreshold;
            if (typeof options.highThreshold === "number") highThreshold = options.highThreshold;
        }

        // Setup validation
        const validate = () => {
            if (!isDifferential && !this._isValidChannel(mux)) {
                return new Error(`Invalid channel '${mux}'. See ADS1x15.channel for options.`);
            } else if (isDifferential && !this._isValidDifferential(mux)) {
                return new Error(`Invalid differential '${mux}'. See ADS1x15.differential for options.`);
            } else if (!this._isValidSPS(sps)) {
                return new Error(`Invalid sps '${sps}'. See ADS1x15.spsADS1115 or ADS1x15.spsADS1015 for options.`);
            } else if (!this._isValidPGA(pga)) {
                return new Error(`Invalid pga '${pga}'. See ADS1x15.pga for options.`);
            } else if (isComparative && !this._isValidComparatorReadingsCount(comparatorReadings)) {
                return new Error(`Invalid comparator readings count '${comparatorReadings}'. See ADS1x15.comparatorReadings for options.`);
            } else if (isComparative && !this._isValidComparatorLatchingMode(comparatorLatchingMode)) {
                return new Error(`Invalid comparator latching mode '${comparatorLatchingMode}'. See ADS1x15.comparatorLatchingMode for options.`);
            } else if (isComparative && !this._isValidComparatorActiveMode(comparatorActiveMode)) {
                return new Error(`Invalid comparator active mode '${comparatorActiveMode}'. See ADS1x15.comparatorActiveMode for options.`);
            } else if (isComparative && !this._isValidComparatorMode(comparatorMode)) {
                return new Error(`Invalid comparator mode '${comparatorMode}'. See ADS1x15.comparatoMode for options.`);
            } else if (isComparative && !this._isValidComparatorThreshold(lowThreshold)) {
                return new Error(`Invalid comparator low threshold '${lowThreshold}'. Provide a 12-bit (ADS1015) or 16-bit (ADS1115) signed integer value.`);
            } else if (isComparative && !this._isValidComparatorThreshold(highThreshold)) {
                return new Error(`Invalid comparator high threshold '${highThreshold}'. Provide a 12-bit (ADS1015) or 16-bit (ADS1115) signed integer value.`);
            } else {
                return null;
            }
        };

        // Do the reading
        this._read(validate, {
            mux,
            pga,
            sps,
            mode,
            comparatorMode,
            comparatorReadings,
            comparatorLatchingMode,
            comparatorActiveMode,
            lowThreshold,
            highThreshold
        }, callback);
    }

    /**
     * Reads the value for given channel in single-shot mode
     * @param {number} channel – Channel to read
     * @param {{sps:number, pga:number}} [options] – Optional reading parameters
     * @param {function(err:Error, value:number, volts:number)} callback
     */
    readChannel(channel, options, callback) {
        if (typeof options === "function") {
            callback = options;
            options = {};
        }
        // Pass to the internal reader in single mode
        options.mux = channel;
        options.isDifferential = false;
        options.mode = ADS1015_REG_CONFIG_MODE_SINGLE;
        this._validateThenRead(options, callback);
    }

    /**
     * Reads a differential value between two channels
     * @param {number} differential – Differential comparator to use
     * @param {{sps:number, pga:number}} [options] – Optional reading parameters
     * @param {function(err:Error, value:number, volts:number)} callback
     */
    readDifferential(differential, options, callback) {
        if (typeof options === "function") {
            callback = options;
            options = {};
        }
        // Pass to the internal reader in single mode
        options.isDifferential = true;
        options.mux = differential;
        options.mode = ADS1015_REG_CONFIG_MODE_SINGLE;
        this._validateThenRead(options, callback);
    }

    /**
     * Starts continuous readings for the given channel, and returns the first reading. Use .getLastReading(...) to fetch future readings
     * @param {number} channel – Channel to read
     * @param {{sps:number, pga:number}} [options] – Optional reading parameters
     * @param {function(err:Error, value:number, volts:number)} callback
     */
    startContinuousChannel(channel, options, callback) {
        if (typeof options === "function") {
            callback = options;
            options = {};
        }
        // Pass to the internal reader in continuous mode
        options.isDifferential = false;
        options.mux = channel;
        options.mode = ADS1015_REG_CONFIG_MODE_CONTIN;
        this._validateThenRead(options, callback);
    }

    /**
     * Starts continuous readings for the given differential, and returns the first reading. Use .getLastReading(...) to fetch future readings
     * @param {number} differential – Differential to read
     * @param {{sps:number, pga:number}} [options] – Optional reading parameters
     * @param {function(err:Error, value:number, volts:number)} callback
     */
    startContinuousDifferential(differential, options, callback) {
        if (typeof options === "function") {
            callback = options;
            options = {};
        }
        // Pass to the internal reader in continuous mode
        options.isDifferential = true;
        options.mux = differential;
        options.mode = ADS1015_REG_CONFIG_MODE_CONTIN;
        this._validateThenRead(options, callback);
    }

    /**
     * Starts continuous comparator mode, triggering the alert pin high or low when the threshold criteria is met.
     * @param {number} channel – Channel to read
     * @param {number} high – High threshold value
     * @param {number} low – Low threshold value
     * @param {{sps:number, pga:number, comparatorMode:number, comparatorActiveMode:number, comparatorLatchingMode:number, comparatorReadings:number}} [options] – Optional reading parameters
     * @param {function(err:Error, value:number, volts:number)} callback
     */
    startComparatorChannel(channel, high, low, options, callback) {
        if (typeof options === "function") {
            callback = options;
            options = {};
        }
        // Pass to the internal reader in continuous mode
        options.isDifferential = false;
        options.isComparative = true;
        options.mux = channel;
        options.mode = ADS1015_REG_CONFIG_MODE_CONTIN;
        options.lowThreshold = low;
        options.highThreshold = high;
        this._validateThenRead(options, callback);
    }

    /**
     * Starts continuous differential comparator mode, triggering the alert pin high or low when the threshold criteria is met.
     * @param {number} differential – Differential comparator to use
     * @param {number} high – High threshold value
     * @param {number} low – Low threshold value
     * @param {{sps:number, pga:number, comparatorMode:number, comparatorActiveMode:number, comparatorLatchingMode:number, comparatorReadings:number}} [options] – Optional reading parameters
     * @param {function(err:Error, value:number, volts:number)} callback
     */
    startComparatorDifferential(differential, high, low, options, callback) {
        if (typeof options === "function") {
            callback = options;
            options = {};
        }
        // Pass to the internal reader in continuous mode
        options.isDifferential = true;
        options.isComparative = true;
        options.mux = differential;
        options.mode = ADS1015_REG_CONFIG_MODE_CONTIN;
        options.lowThreshold = low;
        options.highThreshold = high;
        this._validateThenRead(options, callback);
    }

    /**
     * Gets the latest continuous reading from the chip
     * @param {function(err:Error, value:number, volts:number)} callback
     */
    getLastReading(callback) {
        this._getLastResult(this._lastContinuousPGA, callback);
    }

    /**
     * Stops continuous conversions on the ADS chip
     * @param {function(err:Error)} callback - Fired when completed
     */
    stopContinuousReadings(callback) {
        this._writeConfigRegister(ADS1015_REG_CONFIG_DEFAULT, callback);
    }

}

/**
 * ADS Series Integrated Circuit Chips
 * @type {{IC_ADS1015: number, IC_ADS1115: number}}
 */
ADS1x15.chips = {
    IC_ADS1015: 0x00,
    IC_ADS1115: 0x01
};

/**
 * ADS I2C addresses
 * @type {{ADDRESS_0x48: number, ADDRESS_0x49: number, ADDRESS_0x4A: number, ADDRESS_0x4B: number}}
 */
ADS1x15.address = {
    ADDRESS_0x48: 0x48, // default
    ADDRESS_0x49: 0x49,
    ADDRESS_0x4A: 0x4A,
    ADDRESS_0x4B: 0x4B
};

/**
 * Single ended channel options (mux)
 * @type {{CHANNEL_0: number, CHANNEL_1: number, CHANNEL_2: number, CHANNEL_3: number}}
 */
ADS1x15.channel = {
    CHANNEL_0: ADS1015_REG_CONFIG_MUX_SINGLE_0, // AIN1
    CHANNEL_1: ADS1015_REG_CONFIG_MUX_SINGLE_1, // AIN2
    CHANNEL_2: ADS1015_REG_CONFIG_MUX_SINGLE_2, // AIN3
    CHANNEL_3: ADS1015_REG_CONFIG_MUX_SINGLE_3  // AIN4
};

/**
 * Channel comparator options for differential readings (mux). E.g. DIFF_0_1 => Channel 0 minus Channel 1
 * @type {{DIFF_0_1: number, DIFF_0_3: number, DIFF_1_3: number, DIFF_2_3: number}}
 */
ADS1x15.differential = {
    DIFF_0_1: ADS1015_REG_CONFIG_MUX_DIFF_0_1, // P=AIN0, N=AIN1 (default)
    DIFF_0_3: ADS1015_REG_CONFIG_MUX_DIFF_0_3, // P=AIN0, N=AIN3
    DIFF_1_3: ADS1015_REG_CONFIG_MUX_DIFF_1_3, // P=AIN1, N=AIN3
    DIFF_2_3: ADS1015_REG_CONFIG_MUX_DIFF_2_3  // P=AIN2, N=AIN3
};

/**
 * Power Gain Amplifier ranges (+/- V)
 * @type {{PGA_6_144V: number, PGA_4_096V: number, PGA_2_048V: number, PGA_1_024V: number, PGA_0_512V: number, PGA_0_256V: number}}
 */
ADS1x15.pga = {
    PGA_6_144V: ADS1015_REG_CONFIG_PGA_6_144V,
    PGA_4_096V: ADS1015_REG_CONFIG_PGA_4_096V,
    PGA_2_048V: ADS1015_REG_CONFIG_PGA_2_048V,
    PGA_1_024V: ADS1015_REG_CONFIG_PGA_1_024V,
    PGA_0_512V: ADS1015_REG_CONFIG_PGA_0_512V,
    PGA_0_256V: ADS1015_REG_CONFIG_PGA_0_256V
};

/**
 * PGA range to Volts mappings
 * @type {{}}
 */
ADS1x15.pgaToVolts = {
    [ADS1015_REG_CONFIG_PGA_6_144V]: 6.144,
    [ADS1015_REG_CONFIG_PGA_4_096V]: 4.096,
    [ADS1015_REG_CONFIG_PGA_2_048V]: 2.048,
    [ADS1015_REG_CONFIG_PGA_1_024V]: 1.024,
    [ADS1015_REG_CONFIG_PGA_0_512V]: 0.512,
    [ADS1015_REG_CONFIG_PGA_0_256V]: 0.256
};

/**
 * Samples-Per-Second values for the ADS1115 chip (aka data rate). Lower rate = better average
 * @type {{SPS_8: number, SPS_16: number, SPS_32: number, SPS_64: number, SPS_128: number, SPS_250: number, SPS_475: number, SPS_860: number}}
 */
ADS1x15.spsADS1115 = {
    SPS_8: ADS1115_REG_CONFIG_DR_8SPS,
    SPS_16: ADS1115_REG_CONFIG_DR_16SPS,
    SPS_32: ADS1115_REG_CONFIG_DR_32SPS,
    SPS_64: ADS1115_REG_CONFIG_DR_64SPS,
    SPS_128: ADS1115_REG_CONFIG_DR_128SPS,
    SPS_250: ADS1115_REG_CONFIG_DR_250SPS,
    SPS_475: ADS1115_REG_CONFIG_DR_475SPS,
    SPS_860: ADS1115_REG_CONFIG_DR_860SPS,
};

/**
 * Samples-Per-Second values for the ADS1015 chip (aka data rate). Lower rate = better average
 * @type {{SPS_128: number, SPS_250: number, SPS_490: number, SPS_920: number, SPS_1600: number, SPS_2400: number, SPS_3300: number}}
 */
ADS1x15.spsADS1015 = {
    SPS_128: ADS1015_REG_CONFIG_DR_128SPS,
    SPS_250: ADS1015_REG_CONFIG_DR_250SPS,
    SPS_490: ADS1015_REG_CONFIG_DR_490SPS,
    SPS_920: ADS1015_REG_CONFIG_DR_920SPS,
    SPS_1600: ADS1015_REG_CONFIG_DR_1600SPS,
    SPS_2400: ADS1015_REG_CONFIG_DR_2400SPS,
    SPS_3300: ADS1015_REG_CONFIG_DR_3300SPS,
};

/**
 * Samples per second to milliseconds mappings
 * @type {{ADS1015: *, ADS1115: *}}
 */
ADS1x15.spsToMilliseconds = {
    ADS1015: {
        [ADS1015_REG_CONFIG_DR_128SPS]: 1000 / 128,
        [ADS1015_REG_CONFIG_DR_250SPS]: 1000 / 250,
        [ADS1015_REG_CONFIG_DR_490SPS]: 1000 / 490,
        [ADS1015_REG_CONFIG_DR_920SPS]: 1000 / 920,
        [ADS1015_REG_CONFIG_DR_1600SPS]: 1000 / 1600,
        [ADS1015_REG_CONFIG_DR_2400SPS]: 1000 / 2400,
        [ADS1015_REG_CONFIG_DR_3300SPS]: 1000 / 3300,
    },
    ADS1115: {
        [ADS1115_REG_CONFIG_DR_8SPS]: 1000 / 8,
        [ADS1115_REG_CONFIG_DR_16SPS]: 1000 / 16,
        [ADS1115_REG_CONFIG_DR_32SPS]: 1000 / 32,
        [ADS1115_REG_CONFIG_DR_64SPS]: 1000 / 64,
        [ADS1115_REG_CONFIG_DR_128SPS]: 1000 / 128,
        [ADS1115_REG_CONFIG_DR_250SPS]: 1000 / 250,
        [ADS1115_REG_CONFIG_DR_475SPS]: 1000 / 475,
        [ADS1115_REG_CONFIG_DR_860SPS]: 1000 / 860,
    }
};

/**
 * Whether to pull the ALERT pin HIGH or LOW when the comparator triggers an ALERT
 * @type {{ACTIVE_LOW: boolean, ACTIVE_HIGH: boolean}}
 */
ADS1x15.comparatorActiveMode = {
    ACTIVE_LOW: ADS1015_REG_CONFIG_CPOL_ACTVLOW,   // default
    ACTIVE_HIGH: ADS1015_REG_CONFIG_CPOL_ACTVHI
};

/**
 * How to compare values when operating in comparator mode
 * @type {{INSIDE_RANGE: boolean, OUTSIDE_RANGE: boolean}}
 */
ADS1x15.comparatorMode = {
    // TRADITIONAL: (-MAX)-----(LOW)~~~~~(HIGH)*****(+MAX)    <-- ~~~ asserts only after HIGH has exceeded
    // WINDOW:      (-MAX)*****(LOW)-----(HIGH)*****(+MAX)
    TRADITIONAL: ADS1015_REG_CONFIG_CMODE_TRAD,    // traditional mode (asserts when HIGH exceeded, de-asserts when drops below LOW) default
    WINDOW: ADS1015_REG_CONFIG_CMODE_WINDOW  // window mode (asserts when HIGH exceeded OR drops below LOW)
};

/**
 * How the alert should be held until getLastReading() is called to read the value and clear the alert
 * @type {{LATCHING: boolean, NON_LATCHING: boolean}}
 */
ADS1x15.comparatorLatchingMode = {
    LATCHING: ADS1015_REG_CONFIG_CLAT_LATCH,         // Hold until value is read and alert is cleared
    NON_LATCHING: ADS1015_REG_CONFIG_CLAT_NONLAT     // Do not hold (default)
};

/**
 * The number of readings that match the comparator before triggering the alert
 * @type {{DISABLED: number, READINGS_1: number, READINGS_2: number, READINGS_4: number}}
 */
ADS1x15.comparatorReadings = {
    DISABLED: ADS1015_REG_CONFIG_CQUE_NONE,
    READINGS_1: ADS1015_REG_CONFIG_CQUE_1CONV, // default
    READINGS_2: ADS1015_REG_CONFIG_CQUE_2CONV,
    READINGS_4: ADS1015_REG_CONFIG_CQUE_4CONV
};

/**
 * +/- Min/Max threshold range for alert triggering
 * @type {{ADS1015_MAX_RANGE: number, ADS1115_MAX_RANGE: number}}
 */
ADS1x15.thresholdMaxValues = {
    ADS1015_MAX_RANGE: 2048.0,  // 2^(12-1) // 12bit, -2048 to 2047
    ADS1115_MAX_RANGE: 32768.0  // 2^(16-1) // 16bit, -32768 to 32767
};


module.exports = ADS1x15;