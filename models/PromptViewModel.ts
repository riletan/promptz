import { Schema } from "@/amplify/data/resource";
import { UserViewModel } from "./UserViewModel";

export enum SdlcPhase {
  PLAN = "PLAN",
  REQ = "REQ",
  DESIGN = "DESIGN",
  IMPLEMENT = "IMPLEMENT",
  TEST = "TEST",
  DEPLOY = "DEPLOY",
  MAINTAIN = "MAINTAIN",
  UNKNOWN = "UNKNOWN",
}

export enum PromptCategory {
  CHAT = "CHAT",
  DEV_AGENT = "DEV_AGENT",
  INLINE = "INLINE",
  UNKNOWN = "UNKNOWN",
}

export class PromptViewModel {
  private _id: string;
  private _name: string;
  private _description: string;
  private _sdlcPhase: SdlcPhase;
  private _category: PromptCategory;
  private _instruction: string;
  private _owner?: UserViewModel;

  constructor() {
    this._id = "";
    this._name = "";
    this._description = "";
    this._sdlcPhase = SdlcPhase.UNKNOWN;
    this._category = PromptCategory.UNKNOWN;
    this._instruction = "";
  }

  public static fromSchema(prompt: Schema["prompt"]["type"]): PromptViewModel {
    if (!prompt.owner) {
      throw new Error("Prompt has no owner");
    }

    const pvm = new PromptViewModel();
    pvm._id = prompt.id;
    pvm._name = prompt.name;
    pvm._description = prompt.description;
    pvm._sdlcPhase = prompt.sdlc_phase as SdlcPhase;
    pvm._category = prompt.category as PromptCategory;
    pvm._instruction = prompt.instruction;
    pvm._owner = new UserViewModel(prompt.owner, prompt.owner_username);

    return pvm;
  }

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }
  public set name(value: string) {
    this._name = value;
  }

  public get description(): string {
    return this._description;
  }
  public set description(value: string) {
    this._description = value;
  }

  public get sdlcPhase(): SdlcPhase {
    return this._sdlcPhase;
  }
  public set sdlcPhase(value: SdlcPhase) {
    this._sdlcPhase = value;
  }

  public get category(): PromptCategory {
    return this._category;
  }
  public set category(value: PromptCategory) {
    this._category = value;
  }

  public get instruction(): string {
    return this._instruction;
  }
  public set instruction(value: string) {
    this._instruction = value;
  }

  public isOwnedBy(user: UserViewModel) {
    return this._owner?.userId === user.userId;
  }

  public createdBy() {
    return `created by ${this._owner?.userName}`;
  }

  public copy(): PromptViewModel {
    const clone = new PromptViewModel();
    Object.assign(clone, this);
    return clone;
  }
}
