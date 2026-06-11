import { BranchList } from "./branchList";
import { Mode } from "./types";
import {
  write,
  moveTo,
  clearScreen,
  RESET,
  FG_BLACK,
  FG_WHITE,
  BG_BLUE,
  INVERSE,
} from "./terminal";

const PREFIX_WIDTH = 3; // "M  " = 3 chars

export function renderScreen(
  branchList: BranchList,
  mode: Mode,
  commandBarText: string | null,
  termSize: { rows: number; cols: number },
) {
  clearScreen();
  renderBranchList(branchList, termSize);

  if (commandBarText !== null) {
    renderCommandBarText(commandBarText, termSize);
  } else {
    renderCommandBar(mode, termSize);
  }
}

function renderBranchList(
  branchList: BranchList,
  termSize: { rows: number; cols: number },
) {
  const availableRows = termSize.rows - 1;

  for (let i = 0; i < branchList.branches.length && i < availableRows; i++) {
    const branch = branchList.branches[i];
    const isSelected = i === branchList.selectedIndex;

    const merged = branch.isMerged ? "M" : " ";
    const prefix = `${merged}  `;
    const displayName = branch.isCurrent
      ? `${branch.name} (CURRENT)`
      : branch.name;
    const date = branch.lastCommitDate;
    const gap = Math.max(
      1,
      termSize.cols - PREFIX_WIDTH - displayName.length - date.length,
    );
    const row = `${prefix}${displayName}${" ".repeat(gap)}${date}`;

    moveTo(i + 1, 1);

    if (isSelected) {
      write(`${INVERSE}${row}${RESET}`);
    } else {
      write(row);
    }
  }
}

function renderCommandBar(
  mode: Mode,
  termSize: { rows: number; cols: number },
) {
  moveTo(termSize.rows, 1);

  const bg = BG_BLUE;
  const keyStyle = `${bg}${FG_WHITE}`;
  const textStyle = `${bg}${FG_BLACK}`;

  if (mode === Mode.Normal) {
    const content =
      `${keyStyle}↑/↓${textStyle}: Navigation, ` +
      `${keyStyle}<Enter>${textStyle}: Checkout, ` +
      `${keyStyle}<Ctrl+A>${textStyle}: Action, ` +
      `${keyStyle}<Ctrl+S>${textStyle}: Sort, ` +
      `${keyStyle}<Esc>${textStyle}: Exit`;
    const padding = " ".repeat(
      Math.max(0, termSize.cols - stripAnsi(content).length),
    );
    write(`${content}${bg}${padding}${RESET}`);
  } else {
    const content =
      `${keyStyle}<D>${textStyle}: Delete branch, ` +
      `${keyStyle}<Esc>${textStyle}: Cancel`;
    const padding = " ".repeat(
      Math.max(0, termSize.cols - stripAnsi(content).length),
    );
    write(`${content}${bg}${padding}${RESET}`);
  }
}

function renderCommandBarText(
  text: string,
  termSize: { rows: number; cols: number },
) {
  moveTo(termSize.rows, 1);
  const padding = " ".repeat(Math.max(0, termSize.cols - text.length));
  write(`${BG_BLUE}${FG_BLACK}${text}${padding}${RESET}`);
}

function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

export function renderModal(
  message: string,
  options: string[],
  selectedOption: number,
  termSize: { rows: number; cols: number },
) {
  const buttonRow = options
    .map((opt, i) => {
      if (i === selectedOption) {
        return `${INVERSE} ${opt} ${RESET}`;
      }
      return ` ${opt} `;
    })
    .join("   ");

  const buttonRowPlain = options.map((opt) => ` ${opt} `).join("   ");
  const contentWidth = Math.max(message.length, buttonRowPlain.length) + 4;
  const boxWidth = contentWidth + 2;

  const startCol = Math.floor((termSize.cols - boxWidth) / 2);
  const startRow = Math.floor(termSize.rows / 2) - 2;

  const top = "┌" + "─".repeat(boxWidth - 2) + "┐";
  const emptyLine = "│" + " ".repeat(boxWidth - 2) + "│";
  const bottom = "└" + "─".repeat(boxWidth - 2) + "┘";

  const msgPadLeft = Math.floor((boxWidth - 2 - message.length) / 2);
  const msgPadRight = boxWidth - 2 - message.length - msgPadLeft;
  const msgLine =
    "│" + " ".repeat(msgPadLeft) + message + " ".repeat(msgPadRight) + "│";

  const btnPlainLen = buttonRowPlain.length;
  const btnPadLeft = Math.floor((boxWidth - 2 - btnPlainLen) / 2);
  const btnPadRight = boxWidth - 2 - btnPlainLen - btnPadLeft;
  const btnLine =
    "│" + " ".repeat(btnPadLeft) + buttonRow + " ".repeat(btnPadRight) + "│";

  moveTo(startRow, startCol);
  write(top);
  moveTo(startRow + 1, startCol);
  write(emptyLine);
  moveTo(startRow + 2, startCol);
  write(msgLine);
  moveTo(startRow + 3, startCol);
  write(emptyLine);
  moveTo(startRow + 4, startCol);
  write(btnLine);
  moveTo(startRow + 5, startCol);
  write(emptyLine);
  moveTo(startRow + 6, startCol);
  write(bottom);
}
