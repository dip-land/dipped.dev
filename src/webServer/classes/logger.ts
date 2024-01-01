export class Logger {
    public readonly version = 'main';
    public readonly consoleColor = '\x1b[38;2;' + { main: '55;173;26m' }[this.version];
    public timeCode(type?: 'error'): string {
        return `\x1b[${type === 'error' ? '31m' : '36m'}${new Date().toLocaleString()} ${this.consoleColor}[WebServer]\x1b[0m`;
    }
    /**Console logs data with a blue time code */
    public log(...message: any) {
        console.log(this.timeCode(), ...message);
    }
    /**Console logs data with a red time code */
    public error(...message: any) {
        console.log(this.timeCode('error'), ...message);
    }
}
