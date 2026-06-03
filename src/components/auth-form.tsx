"use client";

import { Eye, TicketCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { authClient } from "@/lib/auth-client";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const search = useSearchParams();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fields, setFields] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const isRegister = mode === "register";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isRegister && fields.password !== fields.confirmPassword) {
      setError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const result = isRegister
        ? await authClient.signUp.email({
            name: fields.name,
            email: fields.email,
            password: fields.password,
          })
        : await authClient.signIn.email({
            email: fields.email,
            password: fields.password,
          });
      if (result.error) throw new Error(result.error.message);
      router.push(search.get("next") ?? "/orders");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "ยังไม่ได้เชื่อมฐานข้อมูล กรุณาตั้งค่า DATABASE_URL ก่อนใช้งานระบบบัญชี",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      onSubmit={submit}
      className="w-full max-w-[500px]"
    >
      <TicketCheck className="text-brand" size={32} />
      <h1 className="mt-5 text-4xl font-black tracking-[-0.04em]">
        {isRegister ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
      </h1>
      <p className="mt-3 leading-7 text-muted">
        {isRegister
          ? "สร้างบัญชีเพื่อดูคำสั่งซื้อและ Voucher ของคุณ"
          : "เข้าสู่ระบบเพื่อดูคำสั่งซื้อและ Voucher ของคุณ"}
      </p>
      <div className="mt-8 grid gap-4">
        {isRegister && (
          <label className="grid gap-2 text-sm font-bold">
            ชื่อ-นามสกุล
            <input
              required
              value={fields.name}
              onChange={(event) => setFields({ ...fields, name: event.target.value })}
              className="h-12 rounded-lg border border-line px-4 font-normal outline-none focus:border-brand transition-colors"
              placeholder="กรอกชื่อ-นามสกุล"
            />
          </label>
        )}
        <label className="grid gap-2 text-sm font-bold">
          อีเมล
          <input
            required
            type="email"
            value={fields.email}
            onChange={(event) => setFields({ ...fields, email: event.target.value })}
            className="h-12 rounded-lg border border-line px-4 font-normal outline-none focus:border-brand transition-colors"
            placeholder="กรอกอีเมลของคุณ"
          />
        </label>
        <label className="relative grid gap-2 text-sm font-bold">
          รหัสผ่าน
          <input
            required
            type="password"
            minLength={8}
            value={fields.password}
            onChange={(event) => setFields({ ...fields, password: event.target.value })}
            className="h-12 rounded-lg border border-line px-4 pr-11 font-normal outline-none focus:border-brand transition-colors"
            placeholder="กรอกรหัสผ่านของคุณ"
          />
          <Eye className="absolute bottom-3.5 right-4 text-muted" size={17} />
        </label>
        {isRegister && (
          <label className="grid gap-2 text-sm font-bold">
            ยืนยันรหัสผ่าน
            <input
              required
              type="password"
              minLength={8}
              value={fields.confirmPassword}
              onChange={(event) =>
                setFields({ ...fields, confirmPassword: event.target.value })
              }
              className="h-12 rounded-lg border border-line px-4 font-normal outline-none focus:border-brand transition-colors"
              placeholder="ยืนยันรหัสผ่านของคุณ"
            />
          </label>
        )}
      </div>
      {error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}
      <motion.button
        whileTap={{ scale: 0.98 }}
        disabled={isLoading}
        className="mt-6 flex h-12 w-full items-center justify-center rounded-lg bg-brand font-bold text-white hover:bg-brand-dark disabled:opacity-60 transition-colors"
      >
        {isLoading
          ? "กำลังดำเนินการ..."
          : isRegister
            ? "สร้างบัญชี"
            : "เข้าสู่ระบบ"}
      </motion.button>
      <p className="mt-6 text-center text-sm text-muted">
        {isRegister ? "มีบัญชีอยู่แล้ว? " : "ยังไม่มีบัญชี? "}
        <a
          className="font-bold text-brand transition-colors hover:text-brand-dark"
          href={isRegister ? "/login" : "/register"}
        >
          {isRegister ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
        </a>
      </p>
    </motion.form>
  );
}
