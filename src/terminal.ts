const ESC = "\x1b";

export const ALTERNATE_SCREEN_ON = `${ESC}[?1049h`;
export const ALTERNATE_SCREEN_OFF = `${ESC}[?1049l`;
export const CURSOR_HIDE = `${ESC}[?25l`;
export const CURSOR_SHOW = `${ESC}[?25h`;
export const CLEAR_SCREEN = `${ESC}[2J`;
export const RESET = `${ESC}[0m`;

export const FG_GREEN = `${ESC}[32m`;
export const FG_BLACK = `${ESC}[30m`;
export const FG_WHITE = `${ESC}[37m`;
export const BG_BLUE = `${ESC}[44m`;
export const INVERSE = `${ESC}[7m`;
export const BOLD = `${ESC}[1m`;

export const KEY_UP = `${ESC}[A`;
export const KEY_DOWN = `${ESC}[B`;
export const KEY_LEFT = `${ESC}[D`;
export const KEY_RIGHT = `${ESC}[C`;
export const KEY_ENTER = "\r";
export const KEY_ESCAPE = ESC;
export const KEY_CTRL_A = "\x01";
export const KEY_CTRL_C = "\x03";
export const KEY_CTRL_S = "\x13";

export function write(text: string) {
  process.stdout.write(text);
}

export function enterRawMode() {
  process.stdin.setRawMode(true);
  process.stdin.resume();
}

export function exitRawMode() {
  process.stdin.setRawMode(false);
  process.stdin.pause();
}

export function enterAlternateScreen() {
  write(ALTERNATE_SCREEN_ON);
}

export function exitAlternateScreen() {
  write(ALTERNATE_SCREEN_OFF);
}

export function hideCursor() {
  write(CURSOR_HIDE);
}

export function showCursor() {
  write(CURSOR_SHOW);
}

export function clearScreen() {
  write(CLEAR_SCREEN);
}

export function moveTo(row: number, col: number) {
  write(`${ESC}[${row};${col}H`);
}

export function getTerminalSize(): { rows: number; cols: number } {
  return {
    rows: process.stdout.rows,
    cols: process.stdout.columns,
  };
}

export function green(text: string): string {
  return `${FG_GREEN}${text}${RESET}`;
}

export function bgBlue(text: string): string {
  return `${BG_BLUE}${text}${RESET}`;
}

export function inverse(text: string): string {
  return `${INVERSE}${text}${RESET}`;
}

export function bold(text: string): string {
  return `${BOLD}${text}${RESET}`;
}
