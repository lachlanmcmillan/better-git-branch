import { BranchList } from "./branchList";
import { Mode, type Branch } from "./types";
import {
  write,
  moveTo,
  clearScreen,
  RESET,
  FG_GREEN,
  FG_SOFT_YELLOW,
  FG_BLACK,
  FG_WHITE,
  DIM,
  BG_BLUE,
  BG_YELLOW,
  BOLD,
  INVERSE,
} from "./terminal";

const PREFIX_WIDTH = 4;

export function renderScreen(
  branchList: BranchList,
  mode: Mode,
  commandBarText: string | null,
  termSize: { rows: number; cols: number },
) {
  clearScreen();
  renderBranchList(branchList, termSize);

  const selectedBranch = branchList.branches[branchList.selectedIndex];
  if (commandBarText !== null) {
    renderCommandBarText(commandBarText, termSize);
  } else {
    renderCommandBar(mode, selectedBranch, termSize);
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

    let status = "";
    if (branch.isMerged) status += "M";
    if (branch.isWorktree) status += "W";
    const statusPadded = status.padStart(PREFIX_WIDTH - 1) + " ";
    const currentSuffix = branch.isCurrent ? " (CURRENT)" : "";
    const displayName = branch.name + currentSuffix;
    const date = branch.lastCommitDate;
    const gap = Math.max(
      1,
      termSize.cols - PREFIX_WIDTH - displayName.length - date.length,
    );

    moveTo(i + 1, 1);

    if (isSelected) {
      const row = `${statusPadded}${displayName}${" ".repeat(gap)}${date}`;
      write(`${INVERSE}${row}${RESET}`);
    } else {
      write(
        `${FG_SOFT_YELLOW}${statusPadded}${RESET}` +
          `${branch.name}` +
          `${FG_GREEN}${currentSuffix}${RESET}` +
          `${" ".repeat(gap)}` +
          `${DIM}${date}${RESET}`,
      );
    }
  }
}

function renderCommandBar(
  mode: Mode,
  selectedBranch: Branch,
  termSize: { rows: number; cols: number },
) {
  moveTo(termSize.rows, 1);

  const tags: string[] = [];
  if (selectedBranch.isMerged) tags.push("MERGED");
  if (selectedBranch.isWorktree) tags.push("WORKTREE");
  const rightText = tags.join("  ");

  const bg = BG_BLUE;
  const keyStyle = `${bg}${FG_WHITE}`;
  const textStyle = `${bg}${FG_BLACK}`;

  if (mode === Mode.Normal) {
    const content =
      `${textStyle}[${keyStyle}^A${textStyle}] Action  ` +
      `${textStyle}[${keyStyle}^S${textStyle}] Sort  ` +
      `${textStyle}[${keyStyle}Enter${textStyle}] Checkout  ` +
      `${textStyle}[${keyStyle}Esc${textStyle}] Exit`;
    const contentLen = stripAnsi(content).length;
    const rightLen = rightText.length;
    const available = termSize.cols - contentLen;
    const showRight = rightLen > 0 && available >= rightLen + 2;
    const padding = showRight
      ? " ".repeat(available - rightLen)
      : " ".repeat(Math.max(0, available));
    const right = showRight ? `${keyStyle}${rightText}` : "";
    write(`${content}${bg}${padding}${right}${RESET}`);
  } else {
    const abg = BG_YELLOW;
    const aKeyStyle = `${abg}${FG_WHITE}`;
    const aTextStyle = `${abg}${FG_BLACK}`;
    const content =
      `${aTextStyle}[${aKeyStyle}D${aTextStyle}] Delete  ` +
      `${aTextStyle}[${aKeyStyle}D!${aTextStyle}] Force Delete  ` +
      `${aTextStyle}[${aKeyStyle}Esc${aTextStyle}] Cancel`;
    const contentLen = stripAnsi(content).length;
    const rightLen = rightText.length;
    const available = termSize.cols - contentLen;
    const showRight = rightLen > 0 && available >= rightLen + 2;
    const padding = showRight
      ? " ".repeat(available - rightLen)
      : " ".repeat(Math.max(0, available));
    const right = showRight ? `${aKeyStyle}${rightText}` : "";
    write(`${content}${abg}${padding}${right}${RESET}`);
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
