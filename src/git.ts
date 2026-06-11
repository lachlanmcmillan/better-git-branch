import { BranchList } from "./branchList";
import { DeleteStatus, type DeleteResult, type Branch } from "./types";

const NOT_FULLY_MERGED = "is not fully merged";
const FIELD_SEPARATOR = "|";

export function gitReadBranches(): BranchList {
  const refResult = Bun.spawnSync([
    "git",
    "for-each-ref",
    "--sort=-committerdate",
    "refs/heads/",
    `--format=%(HEAD)${FIELD_SEPARATOR}%(refname:short)${FIELD_SEPARATOR}%(committerdate:relative)${FIELD_SEPARATOR}%(committerdate:unix)`,
  ]);

  if (refResult.exitCode !== 0) {
    const stderr = refResult.stderr.toString().trim();
    throw new Error(stderr || "failed to call git executable");
  }

  const mergedResult = Bun.spawnSync(["git", "branch", "--merged"]);
  const mergedBranches = new Set(
    mergedResult.stdout
      .toString()
      .trim()
      .split("\n")
      .map((line) => line.replace("*", "").trim())
      .filter(Boolean),
  );

  const lines = refResult.stdout.toString().trim().split("\n").filter(Boolean);

  const branches: Branch[] = lines.map((line) => {
    const [head, name, date, timestamp] = line.split(FIELD_SEPARATOR);
    const isCurrent = head.trim() === "*";

    return {
      name,
      isCurrent,
      isMerged: !isCurrent && mergedBranches.has(name),
      lastCommitDate: date,
      lastCommitTimestamp: parseInt(timestamp, 10),
    };
  });

  const currentIndex = branches.findIndex((b) => b.isCurrent);
  return new BranchList(branches, Math.max(0, currentIndex));
}

export function gitCheckout(branchName: string): string {
  const result = Bun.spawnSync(["git", "checkout", branchName]);
  const stdout = result.stdout.toString();
  const stderr = result.stderr.toString();
  return (stdout + stderr).trim();
}

export function gitBranchDelete(
  branchName: string,
  force: boolean,
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
