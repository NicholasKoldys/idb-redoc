/*
 * Example:
 *     TestsOf({
 *       'Name Of Test Suite': function() {
 *         assertEquals(6, add(2, 4));
 *         assertEquals(6.6, add(2.6, 4));
 *       },
 *      (){} ...
 *     });
 */
/**
 * 
 */
const Suite = {
    title: {
        functionSuite: Function,
    },
};

/**
 * @param {Suite} suite 
 */
export function TestsOf( suite ) {
    let failures = 0;
    for( let test in suite ) {
        let testAction = suite[test];
        try {
            testAction();
            cLog('Test:', test, 'OK');
        } catch (e) {
            failures++;
            fLog('Test:', test, 'FAILED', e);
            console.error(e.stack);
        }
    }
}

export function FastTestOf( suite ) {
    try {
        for( let test in suite ) {
            let testAction = suite[test];
            try {
                testAction();
                cLog('Test:', test, 'OK');
            } catch (e) {
                throw new Error(e, {cause: test});
            }
        }
    } catch (e) {
        fLog('Test:', e.cause, 'FAILED', e);
        console.error(e.stack);
    }
}

/**
 * @param {String} msg 
 */
export function fail(msg) {
    throw new Error('fail(): ' + msg);
}

/**
 * 
 * @param {any} value 
 * @param {String} msg 
 */
export function assert(value, msg) {
    if (!value) {
        throw new Error('assert(): ' + msg);
    }
}

/**
 * @param {any} expected 
 * @param {any} actual 
 */
export function assertEquals(expected, actual) {
    if (expected != actual) {
        throw new Error('assertEquals() "' + expected + '" != "' + actual + '"');
    }
}

/**
 * 
 * @param {any} expected 
 * @param {any} actual 
 */
export function assertStrictEquals(expected, actual) {
    if (expected !== actual) {
        throw new Error('assertStrictEquals() "' + expected + '" !== "' + actual + '"');
    }
}

let stylesC = [
    "color: #00fc43",
    "font-size: 18px"
].join(";");

let stylesF = [
    "color: #fc0000",
    "font-size: 18px"
].join(";");

function cLog(...msg) {
    let fullString = msg.join(' ');
    console.log(`%c${fullString}`, stylesC);
}

function fLog(...msg) {
    let fullString = msg.join(' ');
    console.log(`%c${fullString}`, stylesF);
}