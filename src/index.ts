#!/usr/bin/env bun
import { BranchList } from "./branchList";
import { gitReadBranches, gitCheckout, gitBranchDelete } from "./git";
import { renderScreen } from "./renderer";
import { Mode, DeleteStatus, SortOrder } from "./types";
import {
  enterRawMode,
  exitRawMode,
  enterAlternateScreen,
  exitAlternateScreen,
  hideCursor,
  showCursor,
  getTerminalSize,
  KEY_UP,
  KEY_DOWN,
  KEY_ENTER,
  KEY_ESCAPE,
  KEY_CTRL_A,
  KEY_CTRL_C,
  KEY_CTRL_S,
} from "./terminal";

import packageJson from "../package.json";

const DELETE_BRANCH_PROHIBITED = "Error: Cannot delete current branch";

if (process.argv.includes("--version")) {
  console.log(`v${packageJson.version}`);
  process.exit(0);
}

let branchList: BranchList;
try {
  branchList = gitReadBranches();
} catch (e: any) {
  console.log(e.message);
  process.exit(1);
}

let mode = Mode.Normal;
let sortOrder = SortOrder.RecentFirst;
let commandBarText: string | null = null;

function render() {
  renderScreen(branchList, mode, commandBarText, getTerminalSize());
}

function cleanup() {
  showCursor();
  exitAlternateScreen();
  exitRawMode();
}

enterRawMode();
enterAlternateScreen();
hideCursor();
render();

process.stdin.on("data", (data: Buffer) => {
  const key = data.toString();

  if (key === KEY_UP) {
    mode = Mode.Normal;
    branchList.selectPrev();
    commandBarText = null;
    render();
    return;
  }

  if (key === KEY_DOWN) {
    mode = Mode.Normal;
    branchList.selectNext();
    commandBarText = null;
    render();
    return;
  }

  if (key === KEY_CTRL_A) {
    mode = mode === Mode.Actions ? Mode.Normal : Mode.Actions;
    commandBarText = null;
    render();
    return;
  }

  if (key === KEY_CTRL_S) {
    sortOrder =
      sortOrder === SortOrder.RecentFirst
        ? SortOrder.Alphabetical
        : SortOrder.RecentFirst;
    branchList.sort(sortOrder);
    commandBarText = null;
    render();
    return;
  }

  if (key === "d" && mode === Mode.Actions) {
    if (branchList.isCurrentSelected()) {
      commandBarText = DELETE_BRANCH_PROHIBITED;
      render();
      commandBarText = null;
      return;
    }

    const branchName = branchList.getSelectedBranchName();
    const result = gitBranchDelete(branchName, false);

    if (result.status === DeleteStatus.Ok) {
      branchList.removeSelected();
    }
    commandBarText = result.message;
    render();
    commandBarText = null;
    return;
  }

  if (key === "D" && mode === Mode.Actions) {
    if (branchList.isCurrentSelected()) {
      commandBarText = DELETE_BRANCH_PROHIBITED;
      render();
      commandBarText = null;
      return;
    }

    const branchName = branchList.getSelectedBranchName();
    const result = gitBranchDelete(branchName, true);

    if (result.status === DeleteStatus.Ok) {
      branchList.removeSelected();
    }
    commandBarText = result.message;
    render();
    commandBarText = null;
    return;
  }

  if (key === KEY_ESCAPE || key === KEY_CTRL_C) {
    if (mode === Mode.Actions || commandBarText !== null) {
      mode = Mode.Normal;
      commandBarText = null;
      render();
      return;
    }
    cleanup();
    process.exit(0);
  }

  if (key === KEY_ENTER) {
    if (mode === Mode.Actions) {
      mode = Mode.Normal;
      render();
      return;
    }

    if (!branchList.isCurrentSelected()) {
      cleanup();
      const output = gitCheckout(branchList.getSelectedBranchName());
      console.log(output);
      process.exit(0);
    }
    return;
  }
});
