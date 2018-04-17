# ADS1x15 Interface over I2C

[![Build Status](https://travis-ci.org/kfitzgerald/raspi-kit-ads1x15.svg?branch=master)](https://travis-ci.org/kfitzgerald/raspi-kit-ads1x15) [![Coverage Status](https://coveralls.io/repos/github/kfitzgerald/raspi-kit-ads1x15/badge.svg?branch=master)](https://coveralls.io/github/kfitzgerald/raspi-kit-ads1x15?branch=master)

This module provides an interface to working with the ADS1015 and ADS1115 analog to digital converter chips over I2C.

The primary focus of this module is **code quality and maintainability**. There's nothing worse than half-written, untested
modules that can barely be used for projects. Every feature has been unit tested and hardware tested. If you find a bug, 
please file an issue and a pull request.   

We utilize the [Raspi.js suite](https://github.com/nebrius/raspi) for underlying hardware communication. If you want to
use something other than `raspi-i2c` underlying [swapping it out](#swapping-out-raspi-i2c) isn't much hassle.

This module was written from scratch with inspiration from [Adafruit's Python library](https://github.com/adafruit/Adafruit_Python_ADS1x15) 
and the (not-production-ready, abandoned port of the Adafruit library) [node-ads1x15](https://github.com/alphacharlie/node-ads1x15) module.


## Requirements

To use this module, you'll need:

* **System Requirements** – See [Raspi-I2C](https://github.com/nebrius/raspi-i2c) for specific hardware and operating system requirements.
* **Peer Dependencies** – This module assumes that you have `raspi` and `raspi-i2c` installed in your package.
* **Node.js** – Supports current LTS versions, such as v6 and v8.


## Installation

Your project must have `raspi` and `raspi-i2c` installed, as this module assumes they are installed as peers. 

If you have not done so already, then using npm or yarn:
```sh
npm install raspi raspi-i2c
yarn add raspi raspi-i2c
```

Then install this module using npm or yarn:
```sh
npm install raspi-kit-ads1x15
yarn add raspi-kit-ads1x15
```

## Quick Start

Here's a simple example on using the ADS1x15 class.

```js
"use strict";

const Raspi = require('raspi');
const I2C = require('raspi-i2c').I2C;
const ADS1x15 = require('raspi-kit-ads1x15');

// Init Raspi
Raspi.init(() => {
    
    // Init Raspi-I2c
    const i2c = new I2C();
    
    // Init the ADC
    const adc = new ADS1x15({
        i2c,                                    // i2c interface
        chip: ADS1x15.chips.IC_ADS1015,         // chip model
        address: ADS1x15.address.ADDRESS_0x48,  // i2c address on the bus
        
        // Defaults for future readings
        pga: ADS1x15.pga.PGA_4_096V,            // power-gain-amplifier range
        sps: ADS1x15.spsADS1015.SPS_250         // data rate (samples per second)
    });
    
    // Get a single-ended reading from channel-0 and display the results
    adc.readChannel(ADS1x15.channel.CHANNEL_0, (err, value, volts) => {
        if (err) {
            console.error('Failed to fetch value from ADC', err);
            process.exit(1);
        } else {
            console.log('Channel 0');
            console.log(' * Value:', value);    // will be a 11 or 15 bit integer depending on chip
            console.log(' * Volts:', volts);    // voltage reading factoring in the PGA
            process.exit(0);
        }
    });
    
});
```

The example might produce output that looks like this:

```text
Channel 0
 * Value: 652
 * Volts: 1.304637029799707
```

Simple!


## ADS1x15 Enumerations

The ADS1x15 class exposes static enumeration properties. Please use these enumerations when working with the class.

> Most enumerations map to their respective configuration register bits. 

### `ADS1x15.chips`
Enumeration containing the supported series integrated circuit chips.
*  `ADS1x15.chips.IC_ADS1015` – ADS1015 chip
*  `ADS1x15.chips.IC_ADS1115` – ADS1115 chip (default)

### `ADS1x15.address`
Enumeration containing the supported I2C addresses of the chip series.
*  `ADS1x15.address.ADDRESS_0x48` – `0x48` I2C address (default) 
*  `ADS1x15.address.ADDRESS_0x49` – `0x49` I2C address
*  `ADS1x15.address.ADDRESS_0x4A` – `0x4A` I2C address
*  `ADS1x15.address.ADDRESS_0x4B` – `0x4B` I2C address

### `ADS1x15.channel`
Enumeration containing the single-ended channel list.
*  `ADS1x15.channel.CHANNEL_0` – AIN1 
*  `ADS1x15.channel.CHANNEL_1` – AIN2 
*  `ADS1x15.channel.CHANNEL_2` – AIN3 
*  `ADS1x15.channel.CHANNEL_3` – AIN4

### `ADS1x15.differential`
Enumeration containing the channel comparator options.
*  `ADS1x15.differential.DIFF_0_1` – P=AIN0, N=AIN1, e.g. 1 minus 0 (default)
*  `ADS1x15.differential.DIFF_0_3` – P=AIN0, N=AIN3, e.g. 3 minus 0
*  `ADS1x15.differential.DIFF_1_3` – P=AIN1, N=AIN3, e.g. 3 minus 1
*  `ADS1x15.differential.DIFF_2_3` – P=AIN2, N=AIN3, e.g. 3 minus 2

### `ADS1x15.pga`
Enumeration containing the power gain amplifier options.
*  `ADS1x15.pga.PGA_6_144V` – +/- 6.144V
*  `ADS1x15.pga.PGA_4_096V` – +/- 4.096V
*  `ADS1x15.pga.PGA_2_048V` – +/- 2.048V
*  `ADS1x15.pga.PGA_1_024V` – +/- 1.024V
*  `ADS1x15.pga.PGA_0_512V` – +/- 0.512V
*  `ADS1x15.pga.PGA_0_256V` – +/- 0.256V

### `ADS1x15.pgaToVolts`
Lookup map converting `ADS1x15.pga.*` values into volts.

For example:
```js
const pgaRangeVolts = ADS1x15.pgaToVolts[ADS1x15.pga.PGA_4_096V]; // === 4.096
```

### `ADS1x15.spsADS1015`
Enumeration containing the data rate options for the ADS1015 chip.
*  `ADS1x15.spsADS1015.SPS_128` – 128 samples per second
*  `ADS1x15.spsADS1015.SPS_250` – 250 samples per second
*  `ADS1x15.spsADS1015.SPS_490` – 490 samples per second
*  `ADS1x15.spsADS1015.SPS_920` – 920 samples per second
*  `ADS1x15.spsADS1015.SPS_1600` – 1600 samples per second
*  `ADS1x15.spsADS1015.SPS_2400` – 2400 samples per second
*  `ADS1x15.spsADS1015.SPS_3300` – 3300 samples per second

### `ADS1x15.spsADS1115`
Enumeration containing the data rate options for the ADS1115 chip.
*  `ADS1x15.spsADS1115.SPS_8` – 8 samples per second
*  `ADS1x15.spsADS1115.SPS_16` – 16 samples per second
*  `ADS1x15.spsADS1115.SPS_32` – 32 samples per second
*  `ADS1x15.spsADS1115.SPS_64` – 64 samples per second
*  `ADS1x15.spsADS1115.SPS_128` – 128 samples per second
*  `ADS1x15.spsADS1115.SPS_250` – 250 samples per second
*  `ADS1x15.spsADS1115.SPS_475` – 475 samples per second
*  `ADS1x15.spsADS1115.SPS_860` – 860 samples per second

### `ADS1x15.spsToMilliseconds`
Lookup map converting `ADS1x15.spsADS1x15.*` values into sample time length in milliseconds.

For example:
```js
const sampleLength = ADS1x15.spsToMilliseconds.ADS1015[ADS1x15.spsADS1015.SPS_250]; // === 4 (milliseconds)
```

### `ADS1x15.comparatorMode`
Enumeration containing the comparator modes.
*  `ADS1x15.comparatorMode.TRADITIONAL` – Traditional mode (asserts when HIGH exceeded, de-asserts when drops below LOW, default)
*  `ADS1x15.comparatorMode.WINDOW` – Window mode (asserts when HIGH exceeded OR drops below LOW)

### `ADS1x15.comparatorActiveMode`
Enumeration containing the alert pin active modes.
*  `ADS1x15.comparatorActiveMode.ACTIVE_LOW` – Alert pin goes LOW when threshold met (default)
*  `ADS1x15.comparatorActiveMode.ACTIVE_HIGH` – Alert pin goes HIGH when threshold met

### `ADS1x15.comparatorLatchingMode`
Enumeration containing the latching modes.
*  `ADS1x15.comparatorLatchingMode.LATCHING` – Hold until value is read, alert cleared
*  `ADS1x15.comparatorLatchingMode.NON_LATCHING` – Do not hold (default)

### `ADS1x15.comparatorReadings`
Enumeration containing the comparator reading count options.
*  `ADS1x15.comparatorReadings.DISABLED` – Comparator disabled
*  `ADS1x15.comparatorReadings.READINGS_1` – Trigger alert pin after 1 reading (default for comparator mode) 
*  `ADS1x15.comparatorReadings.READINGS_2` – Trigger alert pin after 2 readings
*  `ADS1x15.comparatorReadings.READINGS_4` – Trigger alert pin after 4 readings

### `ADS1x15.thresholdMaxValues`
Enumeration containing the maximum value range for each chip.
*  `ADS1x15.thresholdMaxValues.ADS1015_MAX_RANGE` – 2048 === 2^(12-1), 12bit (1 bit for sign), -2048 to 2047 reading range
*  `ADS1x15.thresholdMaxValues.ADS1115_MAX_RANGE` – 32768 === 2^(16-1), 16bit (1bit for sign), -32768 to 32767 reading range

> Remember that positive readings range from zero to MAX_RANGE minus one. 
> Negative readings range from -MAX_RANGE to 0.



### `new ADS1x15([options])`
Constructs a new instance of the ADS1x15 class with given optional parameters.

* `options` – Optional configuration parameters
  * `i2c` - (I2C) Raspi-I2C instance or compatible interface. See [swapping it out](#swapping-out-raspi-i2c) for details. Defaults to new instance of raspi-i2c.
  * `chip` – (Enumeration) See [ADS1x15.chips](#ADS1x15.chips). Defaults to `IC_ADS1015` with a warning message to the console.
  * `address` – (Enumeration) See [ADS1x15.address](#ADS1x15.address). Defaults to `ADDRESS_0x48`.
  * `pga` – (Enumeration) See [ADS1x15.pga](#ADS1x15.pga). Defaults to `PGA_2_048V`.
  * `sps` – (Enumeration) See [ADS1x15.spsADS1015](#ADS1x15.spsADS1015) or [ADS1x15.spsADS1115](#ADS1x15.spsADS1115). Defaults to `SPS_250` on ADS1015 and `SPS_1600` on ADS1115. 
  * `spsExtraDelay` – (Number) Additional number of milliseconds to delay _in addition to_ the reading time (based on sps). Defaults to `1` millisecond.
  
#### Examples

Minimum usage, using class defaults:
```js
const adc = new ADS1x15();
```  

Typical usage:
```js
const Raspi = require('raspi');
const I2C = require('raspi-i2c').I2C;
const ADS1x15 = require('raspi-kit-ads1x15');

// Init Raspi
Raspi.init(() => {
    
    // Init Raspi-I2c
    const i2c = new I2C();
    
    // Init the ADC
    const adc = new ADS1x15({
        i2c,                                    // i2c interface
        chip: ADS1x15.chips.IC_ADS1015,         // chip model
        address: ADS1x15.address.ADDRESS_0x48,  // i2c address on the bus
        
        // Defaults for future readings
        pga: ADS1x15.pga.PGA_4_096V,            // power-gain-amplifier range
        sps: ADS1x15.spsADS1015.SPS_250         // data rate (samples per second)
    });
    
    // ...
});
```


### `readChannel(channel, [options,] callback)`
Reads the value for given single-ended channel in single-shot mode.
* `channel` – (Enumeration) The single-ended channel to read from. See [ADS1x15.channel](#ADS1x15.channel) for options.
* `options` – (Object) Optional reading parameters. Can be omitted.
  * `pga` – (Enumeration) See [ADS1x15.pga](#ADS1x15.pga). Defaults to the value set in the constructor.
  * `sps` – (Enumeration) See [ADS1x15.spsADS1015](#ADS1x15.spsADS1015) or [ADS1x15.spsADS1115](#ADS1x15.spsADS1115). Defaults to the value set in the constructor.
* `callback(err, value, volts)` – Callback fired when read operation completed.
  * `err` – (Error) If the operation failed, this value will be truthy.
  * `value` – (Number) The numeric value returned from the chip.  
  * `volts` – (Number) The converted value in volts. 
  
For example:
```js
// Get a single-ended reading from channel-0 and display the results
adc.readChannel(ADS1x15.channel.CHANNEL_0, (err, value, volts) => {
    if (err) {
        console.error('Failed to fetch value from ADC', err);
    } else {
        console.log('Channel 0');
        console.log(' * Value:', value);    // will be a 11 or 15 bit integer depending on chip
        console.log(' * Volts:', volts);    // voltage reading factoring in the PGA
    }
});
```

Check out the [example applications](https://github.com/kfitzgerald/raspi-kit-ads1x15/tree/master/examples) for a more thorough demonstration.


### `readDifferential(differential, [options,] callback)`
Reads the voltage differential for given channel set in single-shot mode. 
* `differential` – (Enumeration) The channel differential to read from. See [ADS1x15.differential](#ADS1x15.differential) for options.
* `options` – (Object) Optional reading parameters. Can be omitted.
  * `pga` – (Enumeration) See [ADS1x15.pga](#ADS1x15.pga). Defaults to the value set in the constructor.
  * `sps` – (Enumeration) See [ADS1x15.spsADS1015](#ADS1x15.spsADS1015) or [ADS1x15.spsADS1115](#ADS1x15.spsADS1115). Defaults to the value set in the constructor.
* `callback(err, value, volts)` – Callback fired when read operation completed.
  * `err` – (Error) If the operation failed, this value will be truthy.
  * `value` – (Number) The numeric value returned from the chip.  
  * `volts` – (Number) The converted value in volts. 

For example:
```js
// Get a differential reading and displays the results
adc.readDifferential(ADS1x15.differential.DIFF_0_1, (err, value, volts) => {
    if (err) {
        console.error('Failed to fetch value from ADC', err);
    } else {
        console.log('Channel 1 minus Channel 0');
        console.log(' * Value:', value);    // will be a 11 or 15 bit integer depending on chip
        console.log(' * Volts:', volts);    // voltage reading factoring in the PGA
    }
});
```

Check out the [example applications](https://github.com/kfitzgerald/raspi-kit-ads1x15/tree/master/examples) for a more thorough demonstration.


### `startContinuousChannel(channel, [options,] callback)`
Starts continuous readings on the ADS chip. Use [getLastReading](#getLastReading-callback) to retrieve future values.
* `channel` – (Enumeration) The single-ended channel to read from. See [ADS1x15.channel](#ADS1x15.channel) for options.
* `options` – (Object) Optional reading parameters. Can be omitted.
  * `pga` – (Enumeration) See [ADS1x15.pga](#ADS1x15.pga). Defaults to the value set in the constructor.
  * `sps` – (Enumeration) See [ADS1x15.spsADS1015](#ADS1x15.spsADS1015) or [ADS1x15.spsADS1115](#ADS1x15.spsADS1115). Defaults to the value set in the constructor.
* `callback(err, value, volts)` – Callback fired when read operation completed. Contains the first reading from the chip.
  * `err` – (Error) If the operation failed, this value will be truthy.
  * `value` – (Number) The numeric value returned from the chip.  
  * `volts` – (Number) The converted value in volts. 
  
For example:
```js
// Starts continuous readings from channel-0 and displays the initial results
adc.startContinuousChannel(ADS1x15.channel.CHANNEL_0, (err, value, volts) => {
    if (err) {
        console.error('Failed to fetch value from ADC', err);
    } else {
        console.log('Channel 0');
        console.log(' * Value:', value);    // will be a 11 or 15 bit integer depending on chip
        console.log(' * Volts:', volts);    // voltage reading factoring in the PGA
    }
    
    // From here on, call adc.getLastReading(...) for future readings
    
    // When done, call adc.stopContinuousReadings(...) to stop the chip readings
});
```

Check out the [example applications](https://github.com/kfitzgerald/raspi-kit-ads1x15/tree/master/examples) for a more thorough demonstration.
  
  
### `startContinuousDifferential(differential, [options,] callback)`
Starts continuous differential readings on the ADS chip. Use [getLastReading](#getLastReading-callback) to retrieve future values.
* `differential` – (Enumeration) The channel differential to read from. See [ADS1x15.differential](#ADS1x15.differential) for options.
* `options` – (Object) Optional reading parameters. Can be omitted.
  * `pga` – (Enumeration) See [ADS1x15.pga](#ADS1x15.pga). Defaults to the value set in the constructor.
  * `sps` – (Enumeration) See [ADS1x15.spsADS1015](#ADS1x15.spsADS1015) or [ADS1x15.spsADS1115](#ADS1x15.spsADS1115). Defaults to the value set in the constructor.
* `callback(err, value, volts)` – Callback fired when read operation completed. Contains the first reading from the chip.
  * `err` – (Error) If the operation failed, this value will be truthy.
  * `value` – (Number) The numeric value returned from the chip.  
  * `volts` – (Number) The converted value in volts.
  
For example:
```js
// Starts continuous differential readings and displays the initial results
adc.startContinuousDifferential(ADS1x15.differential.DIFF_0_1, (err, value, volts) => {
  if (err) {
      console.error('Failed to fetch value from ADC', err);
  } else {
      console.log('Channel 1 minus Channel 0');
      console.log(' * Value:', value);    // will be a 11 or 15 bit integer depending on chip
      console.log(' * Volts:', volts);    // voltage reading factoring in the PGA
  }
  
  // From here on, call adc.getLastReading(...) for future readings
  
  // When done, call adc.stopContinuousReadings(...) to stop the chip readings
});
```

Check out the [example applications](https://github.com/kfitzgerald/raspi-kit-ads1x15/tree/master/examples) for a more thorough demonstration.
  
  
### `startComparatorChannel(channel, high, low, [options,] callback)`
Starts the continuous comparator mode on the ADS chip, triggering the ALERT pin HIGH or LOW when the threshold criteria is met.
Use [getLastReading](#getLastReading-callback) to retrieve values and clear alerts.
* `channel` – (Enumeration) The single-ended channel to read from. See [ADS1x15.channel](#ADS1x15.channel) for options.
* `high` – (Number) The high threshold value, _not Volts_. If you want to use Volts, use the [getThresholdFromVolts](#getThresholdFromVolts-volts-pga) helper function.
* `low` – (Number) The low threshold value, _not Volts_. If you want to use Volts, use the [getThresholdFromVolts](#getThresholdFromVolts-volts-pga) helper function.
* `options` – (Object) Optional reading parameters. Can be omitted.
  * `pga` – (Enumeration) See [ADS1x15.pga](#ADS1x15.pga). Defaults to the value set in the constructor.
  * `sps` – (Enumeration) See [ADS1x15.spsADS1015](#ADS1x15.spsADS1015) or [ADS1x15.spsADS1115](#ADS1x15.spsADS1115). Defaults to the value set in the constructor.
  * `comparatorMode` - (Enumeration) See [ADS1x15.comparatorMode](#ADS1x15.comparatorMode). Defaults to `TRADITIONAL`.
  * `comparatorActiveMode` - (Enumeration) See [ADS1x15.comparatorActiveMode](#ADS1x15.comparatorActiveMode). Defaults to `ACTIVE_LOW`.
  * `comparatorLatchingMode` - (Enumeration) See [ADS1x15.comparatorLatchingMode](#ADS1x15.comparatorLatchingMode). Defaults to `NON_LATCHING`. 
  * `comparatorReadings` - (Enumeration) See [ADS1x15.comparatorReadings](#ADS1x15.comparatorReadings). Defaults to `READINGS_1`. 
* `callback(err, value, volts)` – Callback fired when read operation completed. Contains the first reading from the chip.
  * `err` – (Error) If the operation failed, this value will be truthy.
  * `value` – (Number) The numeric value returned from the chip.  
  * `volts` – (Number) The converted value in volts. 
  
  
For example:
```js
// Starts continuous comparator mode from channel-0 and displays the initial results
adc.startComparatorChannel(ADS1x15.channel.CHANNEL_0, 2000, 1000, (err, value, volts) => {
    if (err) {
        console.error('Failed to fetch value from ADC', err);
    } else {
        console.log('Channel 0');
        console.log(' * Value:', value);    // will be a 11 or 15 bit integer depending on chip
        console.log(' * Volts:', volts);    // voltage reading factoring in the PGA
    }
    
    // From here on, call adc.getLastReading(...) for future readings and to clear latched alerts
    
    // When done, call adc.stopContinuousReadings(...) to stop the chip readings
});
```

Check out the [example applications](https://github.com/kfitzgerald/raspi-kit-ads1x15/tree/master/examples) for a more thorough demonstration.
  
  
### `startComparatorDifferential(differential, high, low, [options,] callback)`
Starts the continuous differential comparator mode on the ADS chip, triggering the ALERT pin HIGH or LOW when the threshold criteria is met. 
Use [getLastReading](#getLastReading-callback) to retrieve values and clear alerts.
* `differential` – (Enumeration) The channel differential to read from. See [ADS1x15.differential](#ADS1x15.differential) for options.
* `high` – (Number) The high threshold value, _not Volts_. If you want to use Volts, use the [getThresholdFromVolts](#getThresholdFromVolts-volts-pga) helper function.
* `low` – (Number) The low threshold value, _not Volts_. If you want to use Volts, use the [getThresholdFromVolts](#getThresholdFromVolts-volts-pga) helper function.
* `options` – (Object) Optional reading parameters. Can be omitted.
  * `pga` – (Enumeration) See [ADS1x15.pga](#ADS1x15.pga). Defaults to the value set in the constructor.
  * `sps` – (Enumeration) See [ADS1x15.spsADS1015](#ADS1x15.spsADS1015) or [ADS1x15.spsADS1115](#ADS1x15.spsADS1115). Defaults to the value set in the constructor.
  * `comparatorMode` - (Enumeration) See [ADS1x15.comparatorMode](#ADS1x15.comparatorMode). Defaults to `TRADITIONAL`.
  * `comparatorActiveMode` - (Enumeration) See [ADS1x15.comparatorActiveMode](#ADS1x15.comparatorActiveMode). Defaults to `ACTIVE_LOW`.
  * `comparatorLatchingMode` - (Enumeration) See [ADS1x15.comparatorLatchingMode](#ADS1x15.comparatorLatchingMode). Defaults to `NON_LATCHING`. 
  * `comparatorReadings` - (Enumeration) See [ADS1x15.comparatorReadings](#ADS1x15.comparatorReadings). Defaults to `READINGS_1`. 
* `callback(err, value, volts)` – Callback fired when read operation completed. Contains the first reading from the chip.
  * `err` – (Error) If the operation failed, this value will be truthy.
  * `value` – (Number) The numeric value returned from the chip.  
  * `volts` – (Number) The converted value in volts. 
  
For example:
```js
// Starts continuous differential readings and displays the initial results
adc.startComparatorDifferential(ADS1x15.differential.DIFF_0_1, -100, -500, (err, value, volts) => {
  if (err) {
      console.error('Failed to fetch value from ADC', err);
  } else {
      console.log('Channel 1 minus Channel 0');
      console.log(' * Value:', value);    // will be a 11 or 15 bit integer depending on chip
      console.log(' * Volts:', volts);    // voltage reading factoring in the PGA
  }
  
    // From here on, call adc.getLastReading(...) for future readings and to clear latched alerts
  
  // When done, call adc.stopContinuousReadings(...) to stop the chip readings
});
```

Check out the [example applications](https://github.com/kfitzgerald/raspi-kit-ads1x15/tree/master/examples) for a more thorough demonstration.
  
  
### `getLastReading(callback)`
Gets the latest reading value stored on the chip. Used when continuous readings are active.
* `callback(err, value, volts)` – Callback fired when read operation completed.
  * `err` – (Error) If the operation failed, this value will be truthy.
  * `value` – (Number) The numeric value returned from the chip.  
  * `volts` – (Number) The converted value in volts.
  
For example:
```js
adc.getLastReading((err, value, volts) => {
    if (err) {
      console.error('Failed to fetch value from ADC', err);
  } else {
      console.log(' * Value:', value);    // will be a 11 or 15 bit integer depending on chip
      console.log(' * Volts:', volts);    // voltage reading factoring in the PGA
  }
});
```


### `stopContinuousReadings(callback)`
Stops continuous conversions on the chip. Call this when done making continuous readings to give the chip a break.
* `callback(err)` – Callback fired when read operation completed.
  * `err` – (Error) If the operation failed, this value will be truthy.
  
For example:
```js
adc.stopContinuousReadings((err) => {
    if (err) {
        console.error('Failed to reset config register');
    } else {
        // good to go
    }
});
```


### `getThresholdFromVolts(volts[, pga])`
Helper function to convert Volts to a 12/16-bit adc value. 
* `volts` – (Number) Known Voltage to convert
* `pga` – (Enumeration) Optional power-gain-amplifier range. See [ADS1x15.pga](#ADS1x15.pga). Defaults to the value set in the constructor.

Returns the 12/16-bit adc value.

For example:
```js
adc.startComparatorChannel(
    ADS1x15.channel.CHANNEL_0,          // channel
    adc.getThresholdFromVolts(3.14),    // high 
    adc.getThresholdFromVolts(1.50),    // low
    (err, value, volts) => {            // callback
        // ...
    }
);
```
 
 
### `getVoltageFromValue(value, pga)`
Helper function to convert a 12/16-bit adc value to volts.
* `value` – (Number) Known 12/16-bit adc value to convert
* `pga` – (Enumeration) Power-gain-amplifier range. See [ADS1x15.pga](#ADS1x15.pga)

Returns the corresponding value in Volts.

For example:
```js
const volts = adc.getVoltageFromValue(2047, ADS1x15.pga.PGA_4_096V)   // returns 4.096
```


## Swapping Out Raspi-I2C

If you are using a different hardware I/O interface other than the [Raspi.js suite](https://github.com/nebrius/raspi), 
you can provide the ADS1x15 class with your own.

In the constructor, pass the `i2c` option with an object that has the following interface:

### `i2c.read(address, register, numberOfBytes, callback(err, buffer))`
This method should read bytes from the I2C interface and return them as a buffer.

* `address` – (integer) I2C address of the device.
* `register` – (integer) Register pointer to read.
* `numberOfBytes` (integer) Number of bytes to read from the register.
* `callback(err, buffer)` (function) Callback to fire when read failed or completed.
  * `err` – Error object set if the read operation failed, or `null` if successful.
  * `buffer` Buffer object containing the bytes read.
  
### `i2c.write(address, register, buffer, callback(err))`
This method should write bytes to an I2C device register.

* `address` – (integer) I2C address of the device.
* `register` – (integer) Register pointer to read.
* `buffer` – (Buffer) Data to write to the register.
* `callback(err)` (function) Callback to fire when write failed or completed.
  * `err` – Error object set if the write operation failed, or `null` if successful.

The interface is simple enough that you should be able to provide your own shim if using another I/O library.

Additionally, you could extend the ADS1x15 class and override the `_getI2CInterface` function:

```js
class MyADS1x15 extends ADS1x15 {
    constructor(options) {
        super(options);
    }
    
    /**
     * Gets the default interface class to I2C
     */
    _getI2CInterface() {
        const myI2CInterface = {
            read: (address, register, byteCount, callback) => {
                callback(null, Buffer.from((new Array(byteCount)).fill(0x00)));
            },
            write: (address, register, buffer, callback) => {
                callback(null);
            }
        };
        return myI2CInterface;
    }
}

// Usage
const ads = new MyADS1x15(); 
ads.readChannel(...);
```

## Contributing

If you find a bug or have suggestions, please open a pull request. Contributions are greatly appreciated.

To maintain standards, please ensure that contributions pass unit tests and has complete code coverage.

To run the tests:
```sh
npm run report
``` 

This script will run the unit tests, code quality and show code coverage. If you are lacking coverage, please
see `coverage/index.html` to narrow down where your coverage is lacking.

## License
TL;DR? see: http://www.tldrlegal.com/license/mit-license

```text
The MIT License (MIT)
Copyright (c) 2018 Kevin M. Fitzgerald

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```