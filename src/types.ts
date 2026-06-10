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
