export type PaymentConfirmation = {
  providerRef: string;
  status: "SUCCEEDED";
};

export interface PaymentProvider {
  readonly name: string;
  confirm(orderNumber: string): Promise<PaymentConfirmation>;
}

class DemoPaymentProvider implements PaymentProvider {
  readonly name = "demo";

  async confirm(orderNumber: string) {
    return {
      providerRef: `demo_${orderNumber}`,
      status: "SUCCEEDED" as const,
    };
  }
}

export function getPaymentProvider(): PaymentProvider {
  if ((process.env.PAYMENT_PROVIDER ?? "demo") !== "demo") {
    throw new Error("Only the demo payment provider is enabled in v1.");
  }
  return new DemoPaymentProvider();
}
