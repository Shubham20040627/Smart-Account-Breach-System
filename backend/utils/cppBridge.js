const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Executes the C++ DSA Logic Demo and returns the output.
 */
exports.executeCPPDemo = (arg = '') => {
    return new Promise((resolve, reject) => {
        const cppFilePath = path.join(__dirname, '../../dsa_logic_demo/SmartSecurityLogic.cpp');
        const outputBinary = path.join(__dirname, '../../dsa_logic_demo/logic_demo.exe'); // For Windows

        // Sanitize argument to prevent command injection
        const safeArg = arg.replace(/[^a-zA-Z0-9_-]/g, '');

        // Command to compile and run (Assuming g++ is installed)
        // On Render/Linux, the binary won't have .exe
        const compileCmd = `g++ "${cppFilePath}" -o "${outputBinary}"`;
        const runCmd = `"${outputBinary}" ${safeArg}`;

        // Check if file exists
        if (!fs.existsSync(cppFilePath)) {
            return reject(new Error('C++ Source file not found'));
        }

        // 1. Try to compile (to ensure it's up to date)
        exec(compileCmd, (compileErr) => {
            // If compilation fails, try to run existing binary if it exists
            // (Useful for environments where g++ might be missing but binary is there)

            exec(runCmd, (runErr, stdout, stderr) => {
                if (runErr) {
                    // If even running fails, maybe we are on Linux/Render
                    const linuxRunCmd = `g++ "${cppFilePath}" -o logic_demo && ./logic_demo ${safeArg}`;
                    exec(linuxRunCmd, (linuxErr, lStdout, lStderr) => {
                        if (linuxErr) {
                            return resolve("C++ Logic Engine: [OFFLINE]");
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
