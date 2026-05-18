import type { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import type { PropertyInput } from "@/lib/validations";

export type WizardFormApi = {
  register: UseFormRegister<PropertyInput>;
  errors: FieldErrors<PropertyInput>;
  setValue: UseFormSetValue<PropertyInput>;
};
