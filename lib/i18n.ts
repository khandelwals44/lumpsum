export type Messages = Record<string, string>;

const en: Messages = {
  app_title: "lumpsum.in",
  share: "Share",
  reset: "Reset"
};

export function t(key: keyof typeof en): string {
  return en[key] ?? "";
}
