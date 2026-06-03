export async function POST() {
  return Response.json(
    { error: "Demo payment confirmation is disabled. Use PromptPay slip verification." },
    { status: 410 },
  );
}
