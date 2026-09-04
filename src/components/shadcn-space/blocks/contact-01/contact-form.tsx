"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const interestOptions = [
  "AI Product Development",
  "AI Agents & Automation",
  "Integration & Deployment",
  "Partnership",
  "Careers",
  "Something else",
];

type ContactFormData = {
  name: string;
  email: string;
  company: string;
  phone: string;
  interest: string;
  message: string;
  consent: boolean;
};

const ContactForm = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    company: "",
    phone: "",
    interest: "",
    message: "",
    consent: false,
  });
  const [submitMessage, setSubmitMessage] = useState("");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.consent) {
      setSubmitMessage("Please agree to be contacted before sending.");
      return;
    }

    const body = [
      `Name: ${formData.name}`,
      `Email: ${formData.email}`,
      `Company: ${formData.company || "Not provided"}`,
      `Phone: ${formData.phone || "Not provided"}`,
      `Interest: ${formData.interest}`,
      "",
      "Message:",
      formData.message,
    ].join("\n");

    window.location.href = `mailto:Vinay@qlugen.com?subject=${encodeURIComponent(
      "Qlugen website enquiry"
    )}&body=${encodeURIComponent(body)}`;
    setSubmitMessage("Opening your email app with the enquiry details.");
  };

  return (
    <div className="w-full">
      <Card className="animate-in fade-in slide-in-from-right-10 fill-mode-both gap-6 rounded-2xl border p-8 ring-0 duration-1000 ease-in-out md:gap-8">
        <CardHeader className="p-0">
          <CardTitle className="text-2xl font-semibold text-primary">
            Send enquiry
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="name"
                name="name"
                placeholder="Name *"
                value={formData.name}
                onChange={handleChange}
                className="h-10 shadow-xs dark:bg-background"
                required
              />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Work email *"
                value={formData.email}
                onChange={handleChange}
                className="h-10 shadow-xs dark:bg-background"
                required
              />
              <Input
                id="company"
                name="company"
                placeholder="Company"
                value={formData.company}
                onChange={handleChange}
                className="h-10 shadow-xs dark:bg-background"
              />
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
                className="h-10 shadow-xs dark:bg-background"
              />
            </div>

            <Select
              value={formData.interest}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, interest: value ?? "" }))
              }
              required
            >
              <SelectTrigger className="h-10! w-full shadow-xs dark:bg-background">
                <SelectValue placeholder="I'm interested in *" />
              </SelectTrigger>
              <SelectContent>
                {interestOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="space-y-2">
              <Label htmlFor="message">Tell us about your project *</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="What are you trying to build, improve or automate?"
                value={formData.message}
                onChange={handleChange}
                className="min-h-28 resize-none shadow-xs dark:bg-background"
                required
              />
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="consent"
                checked={formData.consent}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, consent: checked === true }))
                }
                required
              />
              <Label
                htmlFor="consent"
                className="text-sm font-normal text-primary"
              >
                I agree to be contacted about this enquiry
              </Label>
            </div>

            <Button
              type="submit"
              size="lg"
              className="h-11 rounded-xl bg-primary text-primary-foreground hover:cursor-pointer hover:bg-primary/80"
            >
              Send enquiry
            </Button>
            {submitMessage ? (
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {submitMessage}
              </p>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactForm;
