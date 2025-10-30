/// <reference path="JsProvider.d.ts" />

// This script dumps all symbols found in the modules array. It is compatible with 0vercl0k's wtf symbole-store.json file found in target state.

const modules = [
    "nt",
    "hal",
    "verifier",
    "ntdll",
    "kernelbase"
];

const print = host.diagnostics.debugLog;
const println = str => print(str + "\n");
const getModuleName = mod => mod.slice(mod.lastIndexOf('\\') + 1);
const isSymbolValid = sym => /^[a-zA-Z]+\![a-zA-Z0-9]+$/.test(sym);
const fixHex = addr => "0x" + addr.replace("`","");

function writeFile(file_path, data) {
    const fs = host.namespace.Debugger.Utility.FileSystem;

    let fh = fs.CreateFile(file_path);
    let writer = fs.CreateTextWriter(fh);
    writer.WriteLine(data);
    fh.Close();
}

function findModuleAddr(module) {
    try {
        return host.currentProcess.Modules.First(m => m.Symbols.Name.toLowerCase() == module).BaseAddress.toString();
    } catch(e) {
        // println(e);
        return null;
    }
}

function findModuleRealName(module) {
    try {
        return host.currentProcess.Modules.First(m => m.Symbols.Name.toLowerCase() == module).Name.toString();
    } catch(e) {
        return null;
    }
}

function dumpSymbols(save_path, ...additional_modules) {
    const ctl = host.namespace.Debugger.Utility.Control;

    if(!save_path) {
        throw new Error("Specify a path to save the data (!dump_symbols \"C:\\Users\\xyz\\Desktop\\symbol-store.json\",\"test\",\"...\")");
    }

    let output = {};

    for(let module of [...modules, ...additional_modules]) {
        println(module);

        try {
            let module_data = ctl.ExecuteCommand(`lm m ${module}`)[2];
            output[module] = fixHex(module_data.split(" ")[0]);

            let symbols = ctl.ExecuteCommand(`x ${module}!*`);
            for(let symbol of symbols) {
                let [addr, symbol_name] = symbol.split(" ");
                // println();
                if (!isSymbolValid(symbol_name)) {
                    continue;
                }
                if (symbol_name in output) {
                    // println(`WHAT? ${symbol_name} == ${output[symbol_name]} == ${addr}`);
                    continue;
                }

                output[symbol_name] = fixHex(addr);
            }
        } catch(e) {
            println(e);
        }
    }

    println(`Saving to ${save_path}`);
    writeFile(save_path, JSON.stringify(output, null, 2));
}

function initializeScript() {
    return [
        new host.apiVersionSupport(1, 2),
        new host.functionAlias(dumpSymbols, 'dump_symbols')
    ];
}