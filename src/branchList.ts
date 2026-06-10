export class BranchList {
  branches: string[];
  selectedIndex: number;
  currentIndex: number;

  constructor(branches: string[], selectedIndex: number, currentIndex: number) {
    this.branches = branches;
    this.selectedIndex = selectedIndex;
    this.currentIndex = currentIndex;
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
    return this.selectedIndex === this.currentIndex;
  }

  getSelectedBranchName(): string {
    return this.branches[this.selectedIndex];
  }
}
