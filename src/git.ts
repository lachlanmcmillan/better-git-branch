import { BranchList } from "./branchList";
import { DeleteStatus, type DeleteResult } from "./types";

const NOT_FULLY_MERGED = "is not fully merged";

export function gitReadBranches(): BranchList {
  const result = Bun.spawnSync(["git", "branch"]);

  if (result.exitCode !== 0) {
    const stderr = result.stderr.toString().trim();
    throw new Error(stderr || "failed to call git executable");
  }

  const stdout = result.stdout.toString().trim();
  const branches = stdout.split("\n").map((line) => line.trim());

  const currentBranchIndex = branches.findIndex((line) => line.startsWith("*"));
  if (currentBranchIndex === -1) {
    throw new Error("Could not determine current branch");
  }

  branches[currentBranchIndex] =
    branches[currentBranchIndex].slice(2) + " (CURRENT)";

  return new BranchList(branches, currentBranchIndex, currentBranchIndex);
}

export function gitCheckout(branchName: string): string {
  const result = Bun.spawnSync(["git", "checkout", branchName]);
  const stdout = result.stdout.toString();
  const stderr = result.stderr.toString();
  return (stdout + stderr).trim();
}

export function gitBranchDelete(
  branchName: string,
  force: boolean
): DeleteResult {
  const flag = force ? "-D" : "-d";
  const result = Bun.spawnSync(["git", "branch", flag, branchName]);

  if (result.exitCode === 0) {
    return {
      status: DeleteStatus.Ok,
      message: result.stdout.toString().trim(),
    };
  }

  const stderr = result.stderr.toString().trim();
  if (stderr.includes(NOT_FULLY_MERGED)) {
    return { status: DeleteStatus.NotFullyMerged, message: stderr };
  }
  return { status: DeleteStatus.Error, message: stderr };
}
