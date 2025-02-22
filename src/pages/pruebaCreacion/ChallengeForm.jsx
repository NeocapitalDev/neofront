"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
// import { useFieldArray } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ChallengeForm() {
  const [step, setStep] = useState(0);
  const [stepsCount, setStepsCount] = useState(2);
  const totalSteps = 4;
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isReload = sessionStorage.getItem("reloaded");
      if (isReload) {
        // alert("Se ha perdido el progreso debido a la recarga de la página.");
        sessionStorage.removeItem("reloaded");
        setStep(0);
      }
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      sessionStorage.setItem("reloaded", "true");
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const form = useForm({
    defaultValues: {
      basic: {
        name: "",
        standardPrice: "",
        isOnSale: false,
        currentPrice: "",
        numberOfSteps: 1,
      },
      steps: [],
      payouts: {
        challengeTag: "Normal",
        payoutEligibility: "",
        minimumPayoutAmount: "",
      },
    },
  });

  const { handleSubmit, control, watch } = form;
  const currentSteps = watch("basic.numberOfSteps");
  const MIN_STEPS = 1;
  const MAX_STEPS = 3;

  const onSubmit = async (formData) => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      console.log(formData);
      toast.success("Challenge created successfully");
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <FormField
              control={control}
              name="basic.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400">Nombre *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nombre del Reto"
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="basic.standardPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400">
                    Standard Price *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Enter price"
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="basic.isOnSale"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-zinc-700 p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-yellow-400"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-zinc-400">
                      Is this challenge on sale?
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="basic.numberOfSteps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400">
                    Numero de Pasos
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        type="range"
                        min={MIN_STEPS}
                        max={MAX_STEPS}
                        {...field}
                        className="accent-yellow-400"
                        onChange={(e) => {
                          field.onChange(e);
                          setStepsCount(Number.parseInt(e.target.value));
                        }}
                      />
                      <div className="text-center text-white">
                        {field.value}
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            {Array.from({ length: stepsCount }).map((_, index) => (
              <FormField
                key={index}
                control={control}
                name={`steps.${index}`}
                render={({ field }) => (
                  <Card className="bg-zinc-800 border-zinc-700">
                    <CardHeader>
                      <CardTitle className="text-white">
                        {index === stepsCount - 1
                          ? "Funding Step"
                          : `Step ${index + 1}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormItem>
                        <FormLabel className="text-zinc-400">
                          Minimum Trading Days
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            defaultValue={3}
                            className="bg-zinc-900 border-zinc-700 text-white"
                          />
                        </FormControl>
                      </FormItem>

                      <FormItem>
                        <FormLabel className="text-zinc-400">
                          Maximum Daily Loss (%)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            defaultValue={5}
                            className="bg-zinc-900 border-zinc-700 text-white"
                          />
                        </FormControl>
                      </FormItem>

                      <FormItem>
                        <FormLabel className="text-zinc-400">
                          Maximum Loss (%)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            defaultValue={10}
                            className="bg-zinc-900 border-zinc-700 text-white"
                          />
                        </FormControl>
                      </FormItem>

                      <FormItem>
                        <FormLabel className="text-zinc-400">
                          Profit Target (%)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            defaultValue={8}
                            className="bg-zinc-900 border-zinc-700 text-white"
                          />
                        </FormControl>
                      </FormItem>

                      <FormItem>
                        <FormLabel className="text-zinc-400">
                          Leverage
                        </FormLabel>
                        <Select defaultValue="1:100">
                          <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1:100">1:100</SelectItem>
                            <SelectItem value="1:200">1:200</SelectItem>
                            <SelectItem value="1:500">1:500</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    </CardContent>
                  </Card>
                )}
              />
            ))}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <FormField
              control={control}
              name="payouts.challengeTag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400">Challenge Tag</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="Special">Special</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="payouts.payoutEligibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400">
                    Payout Eligibility *
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Select eligibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="delayed">Delayed</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="payouts.minimumPayoutAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400">
                    Minimum Payout Amount *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 text-white">
            <div>
              <h3 className="text-yellow-400 font-medium mb-2">
                Datos Generales
              </h3>
              <div className="space-y-1">
                <p>Name: {watch("basic.name")}</p>
                <p>Standard Price: ${watch("basic.standardPrice")}</p>
                <p>Number of Steps: {watch("basic.numberOfSteps")}</p>
              </div>
            </div>

            <div>
              <h3 className="text-yellow-400 font-medium mb-2">
                Steps Configuration
              </h3>
              <div className="space-y-2">
                {watch("steps")?.map((step, index) => (
                  <div key={index} className="bg-zinc-800 p-4 rounded-lg">
                    <p className="font-medium">
                      {index === stepsCount - 1
                        ? "Funding Step"
                        : `Step ${index + 1}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-yellow-400 font-medium mb-2">
                información de Pago
              </h3>
              <div className="space-y-1">
                <p>Challenge Tag: {watch("payouts.challengeTag")}</p>
                <p>Payout Eligibility: {watch("payouts.payoutEligibility")}</p>
                <p>Minimum Payout: ${watch("payouts.minimumPayoutAmount")}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-4">
        <div className="flex items-center justify-center">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div key={index} className="flex items-center">
              <div
                className={cn(
                  "w-4 h-4 rounded-full transition-all duration-300 ease-in-out",
                  index <= step ? "bg-yellow-400" : "bg-zinc-700"
                )}
              />
              {index < totalSteps - 1 && (
                <div
                  className={cn(
                    "w-8 h-0.5",
                    index < step ? "bg-yellow-400" : "bg-zinc-700"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg text-white">
              Crear Challenge
            </CardTitle>
            <CardDescription>
              Step {step + 1} of {totalSteps}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {renderStepContent()}

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={step === 0}
                    className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white"
                  >
                    Atrás
                  </Button>
                  <Button
                    type="submit"
                    className="bg-yellow-400 text-black hover:bg-yellow-500"
                  >
                    {step === totalSteps - 1 ? "Crear Challenge" : "Siguiente"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
