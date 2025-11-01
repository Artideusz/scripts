#!/usr/bin/env python3
import r2pipe
import json
import os
import sys

def analyze_binary(filename):
    r2 = r2pipe.open(filename, flags=['-2'])
    r2.cmd('aaa')

    # Get the image base from the binary info
    info = json.loads(r2.cmd('ij'))
    image_base = info.get('bin', {}).get('baddr', 0)
    print(f"[+] Image base: 0x{image_base:x}")

    functions = json.loads(r2.cmd('aflj')) or []
    addresses = set()

    for fn in functions:
        fn_addr = fn.get('offset')
        if fn_addr is None:
            continue
        disasm = json.loads(r2.cmd(f'pdfj @ {fn_addr}')) or {}
        ops = disasm.get('ops', [])
        for op in ops:
            if 'offset' in op:
                # Convert VA → RVA
                rel = op['offset'] - image_base
                if rel >= 0:
                    addresses.add(rel)

    r2.quit()
    return sorted(addresses)

def main():
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <binary>")
        sys.exit(1)

    filename = sys.argv[1]
    if not os.path.exists(filename):
        print(f"Error: file '{filename}' not found.")
        sys.exit(1)

    name = os.path.splitext(os.path.basename(filename))[0]
    print(f"[+] Analyzing {name}...")

    addresses = analyze_binary(filename)
    result = {"name": name, "addresses": addresses}

    out_file = f"{name}_coverage.json"
    with open(out_file, "w") as f:
        json.dump(result, f, indent=2)

    print(f"[+] Done. Wrote {len(addresses)} addresses to {out_file}")

if __name__ == "__main__":
    main()
