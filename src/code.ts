export class Writer {
    output = "";
    indent = 0;

    protected reset(): void {
        this.output = "";
        this.indent = 0;
    }

    protected writeln(line: string): void {
        const indent = "\t".repeat(this.indent);
        this.output += `${indent}${line}\n`;
    }
}
