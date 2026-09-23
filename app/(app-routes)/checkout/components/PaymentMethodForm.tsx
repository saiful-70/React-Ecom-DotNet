"use client";

import type { PaymentMethod } from "@/(app-routes)/checkout/model";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";
import { Label } from "@/components/shared/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/shared/ui/radio-group";
import { useFeature } from "@/components/shared/providers/variant-provider";
import { Banknote, CreditCard, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PaymentMethodFormProps {
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  /** Disabled while the order is being placed / the gateway is opening. */
  disabled?: boolean;
}

// Only these three are wired end-to-end on the backend. bKash / Nagad /
// SSLCommerz have no API — do not add them here as dead options.
const PAYMENT_OPTIONS: {
  value: PaymentMethod;
  Icon: typeof Banknote;
  labelKey: string;
  labelFallback: string;
  descriptionKey: string;
  descriptionFallback: string;
}[] = [
  {
    value: "cod",
    Icon: Banknote,
    labelKey: "checkout.paymentCod",
    labelFallback: "Cash on Delivery",
    descriptionKey: "checkout.paymentCodDesc",
    descriptionFallback: "Pay the courier when your order arrives.",
  },
  {
    value: "stripe",
    Icon: CreditCard,
    labelKey: "checkout.paymentStripe",
    labelFallback: "Card (Stripe)",
    descriptionKey: "checkout.paymentStripeDesc",
    descriptionFallback: "Pay by card on Stripe's secure page.",
  },
  {
    value: "paypal",
    Icon: Wallet,
    labelKey: "checkout.paymentPaypal",
    labelFallback: "PayPal",
    descriptionKey: "checkout.paymentPaypalDesc",
    descriptionFallback: "Pay with your PayPal balance or a linked card.",
  },
];

export function PaymentMethodForm({
  paymentMethod,
  onPaymentMethodChange,
  disabled = false,
}: PaymentMethodFormProps) {
  const { t } = useTranslation();
  const onlinePayments = useFeature("onlinePayments");
  const options = onlinePayments
    ? PAYMENT_OPTIONS
    : PAYMENT_OPTIONS.filter((o) => o.value === "cod");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wallet className="w-5 h-5 mr-2" />
          {t("checkout.paymentMethod") || "Payment Method"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={paymentMethod}
          onValueChange={(value: string) =>
            onPaymentMethodChange(value as PaymentMethod)
          }
          disabled={disabled}
        >
          <div className="space-y-3">
            {options.map(
              ({
                value,
                Icon,
                labelKey,
                labelFallback,
                descriptionKey,
                descriptionFallback,
              }) => (
                <Label
                  key={value}
                  htmlFor={`payment-${value}`}
                  className="flex items-start space-x-3 border rounded-lg p-3 cursor-pointer hover:bg-accent transition-colors has-[:checked]:border-primary"
                >
                  <RadioGroupItem
                    value={value}
                    id={`payment-${value}`}
                    className="mt-1"
                  />
                  <Icon className="w-5 h-5 mt-0.5 text-muted-foreground shrink-0" />
                  <span className="space-y-1">
                    <span className="block font-medium">
                      {t(labelKey) || labelFallback}
                    </span>
                    <span className="block text-sm text-muted-foreground font-normal">
                      {t(descriptionKey) || descriptionFallback}
                    </span>
                  </span>
                </Label>
              )
            )}
          </div>
        </RadioGroup>

        {paymentMethod !== "cod" ? (
          <p className="mt-4 text-sm text-muted-foreground">
            {t("checkout.paymentRedirectNotice") ||
              "You will be redirected to complete the payment after the order is created."}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
