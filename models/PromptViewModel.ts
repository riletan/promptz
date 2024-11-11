import { Schema } from "@/amplify/data/resource";
import { UserViewModel } from "./UserViewModel";
import validator from "validator";
import { v4 as uuidv4 } from "uuid";

export enum SdlcPhase {
  PLAN = "Plan",
  REQ = "Requirements",
  DESIGN = "Design",
  IMPLEMENT = "Implement",
  TEST = "Test",
  DEPLOY = "Deploy",
  MAINTAIN = "Maintain",
  UNKNOWN = "Unknown",
}

export enum PromptCategory {
  CHAT = "Chat",
  DEV_AGENT = "Dev Agent",
  INLINE = "Inline",
  UNKNOWN = "Unknown",
}

export type ValidationError = { key: string; value: string };

export type ValidationResult = {
  isValid: boolean;
  errors: Array<ValidationError>;
};

export class PromptViewModel {
  private _id: string;
  private _name: string;
  private _description: string;
  private _sdlcPhase: SdlcPhase;
  private _category: PromptCategory;
  private _instruction: string;
  private _owner?: UserViewModel;

  constructor() {
    this._id = `draft_${uuidv4()}`;
    this._name = "Unnamed [DRAFT]";
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

  public validate() {
    const nameValidation = this.validateProperty(this._name, {
      field: "name",
      minLength: 3,
      maxLength: 100,
    });

    const descriptionValidation = this.validateProperty(this._description, {
      field: "description",
      minLength: 10,
      maxLength: 500,
    });

    const instructionValidation = this.validateProperty(this._instruction, {
      field: "instruction",
      minLength: 10,
      maxLength: 4000,
    });

    return {
      name: nameValidation,
      description: descriptionValidation,
      instruction: instructionValidation,
      isValid:
        nameValidation.isValid &&
        descriptionValidation.isValid &&
        instructionValidation.isValid,
    };
  }

  public copy(): PromptViewModel {
    const clone = new PromptViewModel();
    Object.assign(clone, this);
    return clone;
  }

  private validateProperty(
    value: string,
    options: {
      field: keyof PromptViewModel;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    },
  ): ValidationResult {
    const { field, minLength = 0, maxLength = 2000, required = true } = options;

    // Trim the input
    const errors: Array<ValidationError> = [];

    // Check if field is required
    if (required && validator.isEmpty(value)) {
      errors.push({ key: field, value: `${field} is required` });
    }

    // Validate length
    if (!validator.isLength(value, { min: minLength, max: maxLength })) {
      errors.push({
        key: field,
        value: `${field} must be between ${minLength} and ${maxLength} characters`,
      });
    }

    return { isValid: errors.length === 0 ? true : false, errors };
  }
}
