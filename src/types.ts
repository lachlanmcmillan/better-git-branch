export enum DeleteStatus {
  Ok = "Ok",
  NotFullyMerged = "NotFullyMerged",
  Error = "Error",
}

export interface DeleteResult {
  status: DeleteStatus;
  message: string;
}

export enum Mode {
  Normal = "Normal",
  Actions = "Actions",
}

export enum SortOrder {
  RecentFirst = "RecentFirst",
  Alphabetical = "Alphabetical",
}

export interface Branch {
  name: string;
  isCurrent: boolean;
  isMerged: boolean;
  lastCommitDate: string;
  lastCommitTimestamp: number;
}
