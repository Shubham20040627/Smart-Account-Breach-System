const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Executes the C++ DSA Logic Demo and returns the output.
 */
exports.executeCPPDemo = (...args) => {
    return new Promise((resolve, reject) => {
        const cppFilePath = path.join(__dirname, '../../dsa_logic_demo/SmartSecurityLogic.cpp');
        const outputBinary = path.join(__dirname, '../../dsa_logic_demo/logic_demo.exe');

        // Sanitize all arguments
        const safeArgs = args.map(arg => String(arg).replace(/[^a-zA-Z0-9._,-]/g, '')).join(' ');

        // Command to compile and run
        const compileCmd = `g++ "${cppFilePath}" -o "${outputBinary}"`;
        const runCmd = `"${outputBinary}" ${safeArgs}`;

        if (!fs.existsSync(cppFilePath)) {
            return reject(new Error('C++ Source file not found'));
        }

        // 🛠️ Robust Update Strategy:
        // Delete old binary first to ensure we aren't running stale code if compilation fails
        try {
            if (fs.existsSync(outputBinary)) {
                fs.unlinkSync(outputBinary);
            }
        } catch (err) {
            console.error('Warning: Could not delete old C++ binary (it might be in use).');
        }

        exec(compileCmd, (compileErr) => {
            // Even if compilation fails, try to run (in case it's a Linux environment or binary exists)
            exec(runCmd, (runErr, stdout, stderr) => {
                if (runErr) {
                    // Fallback for Linux/Render environment
                    const linuxRunCmd = `g++ "${cppFilePath}" -o logic_demo && ./logic_demo ${safeArgs}`;
                    exec(linuxRunCmd, (linuxErr, lStdout, lStderr) => {
                        if (linuxErr) {
                            return resolve("C++ Logic Engine: [OFFLINE]. Make sure g++ is installed.");
                        }
                        resolve(lStdout);
                    });
                } else {
                    resolve(stdout);
                }
            });
        });
    });
};
