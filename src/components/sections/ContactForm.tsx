"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";

interface ContactFormProps {
  email: string;
  labels: {
    company: string;
    name: string;
    email: string;
    type: string;
    types: Record<"data" | "research" | "other", string>;
    message: string;
    messageHint: string;
    submit: string;
    note: string;
    subject: string;
  };
}

const field =
  "mt-2 block w-full rounded-[10px] border border-line-strong bg-paper px-3 text-[15px] text-ink " +
  "placeholder:text-ink-3 transition-colors hover:border-ink-3 focus:border-ink focus:outline-none";

/**
 * Builds an email in the visitor's own mail app. Nothing is posted anywhere:
 * the site has no backend, and the form never stores what is typed.
 */
export function ContactForm({ email, labels }: ContactFormProps) {
  const [type, setType] = useState<keyof ContactFormProps["labels"]["types"]>("data");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (key: string) => String(data.get(key) ?? "").trim();
    const body = [
      `${labels.company}: ${get("company")}`,
      `${labels.name}: ${get("name")}`,
      `${labels.email}: ${get("email")}`,
      `${labels.type}: ${labels.types[type]}`,
      "",
      get("message"),
    ].join("\n");
    const subject = `${labels.subject} — ${labels.types[type]}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
      <label className="block text-[14px] font-medium leading-5 text-ink">
        {labels.company}
        <input name="company" required autoComplete="organization" className={`${field} h-11`} />
      </label>
      <label className="block text-[14px] font-medium leading-5 text-ink">
        {labels.name}
        <input name="name" required autoComplete="name" className={`${field} h-11`} />
      </label>
      <label className="block text-[14px] font-medium leading-5 text-ink">
        {labels.email}
        <input name="email" type="email" required autoComplete="email" className={`${field} h-11`} />
      </label>
      <label className="block text-[14px] font-medium leading-5 text-ink">
        {labels.type}
        <select
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          className={`${field} h-11 appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10`}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2374746d' stroke-width='1.75'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          }}
        >
          {(Object.keys(labels.types) as (typeof type)[]).map((key) => (
            <option key={key} value={key}>
              {labels.types[key]}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-[14px] font-medium leading-5 text-ink sm:col-span-2">
        {labels.message}
        <textarea
          name="message"
          required
          rows={6}
          placeholder={labels.messageHint}
          className={`${field} resize-y py-3 leading-6`}
        />
      </label>

      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center">
        <button
          type="submit"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-ink px-5 text-[15px] font-medium text-paper transition-colors hover:bg-[#333] active:translate-y-px"
        >
          {labels.submit}
          <ArrowRight aria-hidden className="size-[18px]" strokeWidth={1.75} />
        </button>
        <p className="text-[13px] leading-5 text-ink-3">{labels.note}</p>
      </div>
    </form>
  );
}
