import type { Branch } from "./types";

export class BranchList {
  branches: Branch[];
  selectedIndex: number;

  constructor(branches: Branch[], selectedIndex: number) {
    this.branches = branches;
    this.selectedIndex = selectedIndex;
  }

  selectNext() {
    if (this.selectedIndex >= this.branches.length - 1) {
      this.selectedIndex = 0;
    } else {
      this.selectedIndex++;
    }
  }

  selectPrev() {
    if (this.selectedIndex === 0) {
      this.selectedIndex = this.branches.length - 1;
    } else {
      this.selectedIndex--;
    }
  }

  removeSelected() {
    this.branches.splice(this.selectedIndex, 1);
    if (this.selectedIndex >= this.branches.length) {
      this.selectedIndex = this.branches.length - 1;
    }
  }

  isCurrentSelected(): boolean {
    return this.branches[this.selectedIndex].isCurrent;
  }

  getSelectedBranchName(): string {
    return this.branches[this.selectedIndex].name;
  }
}
