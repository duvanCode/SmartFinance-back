export interface IWizardRepository {
  isSetupCompleted(userId: string): Promise<boolean>;
  markSetupCompleted(userId: string): Promise<void>;
}

export const WIZARD_REPOSITORY = Symbol('IWizardRepository');
