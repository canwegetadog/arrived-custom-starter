"use client";

import { useActionState, useEffect } from "react";

import {
  type RegistrationState,
  submitRegistration,
} from "@/app/actions/register";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  HappilyEnv,
  PublicForm,
  RegistrationFormType,
} from "@/lib/happily/types";

type RegistrationFormProps = {
  eventId: string;
  env: HappilyEnv;
  form: PublicForm;
  formType?: RegistrationFormType;
  redirectTo?: string;
  buttonText?: string | null;
  onSuccess?: () => void;
};

const initialState: RegistrationState = {
  ok: false,
};

function fieldInputType(inputType: string) {
  if (inputType === "email") return "email";
  if (inputType === "phone") return "tel";
  if (inputType === "number") return "number";
  if (inputType === "date") return "date";
  return "text";
}

function fieldName(id: string) {
  if (id === "emailAddress" || id === "email_address") {
    return "email";
  }

  return id;
}

export function RegistrationForm({
  eventId,
  env,
  form,
  formType = 2,
  redirectTo,
  buttonText,
  onSuccess,
}: RegistrationFormProps) {
  const action = submitRegistration.bind(null, {
    eventId,
    env,
    formId: form.id,
    formType,
    redirectTo,
  });
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.ok && onSuccess) {
      onSuccess();
    }
  }, [state.ok, onSuccess]);

  const schema = form.content.formSchema;
  const fields = form.content.fieldOrder
    .map((fieldKey) => schema.properties[fieldKey])
    .filter((field) => field?.enabled);

  if (!form.is_active) {
    return (
      <p className="rounded-(--event-border-radius) border border-(--event-base-text)/10 bg-(--event-base-bg)/70 p-4 text-sm">
        Registration is currently closed.
      </p>
    );
  }

  if (form.at_capacity) {
    return (
      <p className="rounded-(--event-border-radius) border border-(--event-base-text)/10 bg-(--event-base-bg)/70 p-4 text-sm">
        Registration is at capacity.
      </p>
    );
  }

  const singleField = fields.length === 1;

  return (
    <form
      action={formAction}
      className={
        singleField
          ? "mx-auto flex w-full max-w-lg flex-col gap-4"
          : "flex w-full flex-col gap-x-5 gap-y-3 md:grid md:grid-cols-2"
      }
    >
      {fields.map((field) => {
        const name = fieldName(field.id);

        return (
          <div key={field.id} className="grid w-full gap-1.5">
            <Label htmlFor={field.id}>
              {field.title}
              {field.required ? " *" : ""}
            </Label>
            {field.inputType === "textarea" ? (
              <Textarea
                id={field.id}
                name={name}
                required={field.required}
                placeholder={field.title}
                rows={4}
              />
            ) : field.inputType === "select" ||
              field.inputType === "radio" ||
              field.inputType === "dropdown" ? (
              <Select name={name} required={field.required}>
                <SelectTrigger id={field.id} className="w-full">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {field.items?.enum?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.inputType === "checkbox" && field.items?.enum?.length ? (
              <div className="grid gap-2 rounded-md p-3">
                {field.items.enum.map((option) => (
                  <div
                    key={option}
                    className="flex items-center text-left gap-2"
                  >
                    <Checkbox
                      id={`${field.id}-${option}`}
                      name={name}
                      value={option}
                    />
                    <Label
                      htmlFor={`${field.id}-${option}`}
                      className="text-sm font-normal"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <Input
                id={field.id}
                name={name}
                type={fieldInputType(field.inputType)}
                required={field.required}
                placeholder={field.title}
              />
            )}
          </div>
        );
      })}

      {state.message ? (
        <p
          className={`col-span-2 rounded-md p-3 text-sm ${
            state.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <div className="col-span-2 mt-4 flex justify-center">
        <Button
          type="submit"
          disabled={isPending}
          size="lg"
          className="min-h-12 min-w-48 rounded-none bg-(--event-primary-bg) font-mono text-sm tracking-wide uppercase text-(--event-primary-text) hover:bg-(--event-primary-bg)/85"
        >
          {isPending
            ? "Submitting..."
            : buttonText || form.form_button_text || "Register"}
        </Button>
      </div>
    </form>
  );
}
