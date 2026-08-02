/**
 * Site profile — personal data.
 *
 * This is the one place to update your real identity. Every page reads
 * from here, so keep it in sync with your actual info.
 */
export const profile = {
  handle: "poqpwppy",
  name: "Đặng Lê Đăng Khoa",
  titleVi: "Intern Penetration Tester / Sinh viên An toàn Thông tin",
  titleEn: "Intern Penetration Tester / Information Security Student",
  location: "Đà Nẵng, Việt Nam",
  email: "khoa.dang@viethope.org",
  phone: "(+84) 702755999",
  university: "Trường Đại học FPT Đà Nẵng",
  universityEn: "FPT University, Da Nang",
  degree: "Cử nhân An toàn Thông tin (Cyber Security)",
  ctfTeam: "ARESx",
  website: "https://poqpwppy.github.io",

  skills: [
    { label: "Web Exploitation & Pentest", level: 80, group: "offensive" },
    { label: "Burp Suite / Nmap / Metasploit", level: 80, group: "offensive" },
    { label: "Docker / Portainer / Tailscale", level: 85, group: "infrastructure" },
    { label: "Network Security & AdGuard Home", level: 85, group: "infrastructure" },
    { label: "Reverse Engineering & Forensics", level: 60, group: "defensive" },
    { label: "C++ / Python / JavaScript", level: 80, group: "tooling" },
  ],

  experience: [
    {
      period: "03/2026 - Present",
      roleVi: "Technical / Security Compliance Support (Volunteer)",
      roleEn: "Technical / Security Compliance Support (Volunteer)",
      org: "VietHope (viethope.org)",
      descVi: "Rà soát hệ thống nội bộ theo tiêu chuẩn an ninh mạng baseline, tư vấn giải pháp hardening giảm thiểu rủi ro cho tổ chức phi lợi nhuận.",
      descEn: "Reviewed internal systems against baseline security standards and advised hardening measures for non-profit organization.",
    },
  ],

  projects: [
    {
      titleVi: "Homestay Booking Platform Assessment",
      titleEn: "Homestay Booking Platform Assessment",
      url: "onihomestay.com",
      descVi: "Phát hiện & báo cáo lỗ hổng IDOR làm rò rỉ hình ảnh CCCD người dùng và lỗi logic thanh toán bypass payment.",
      descEn: "Discovered & responsibly reported critical IDOR exposing CCCD images and payment bypass business logic flaw.",
    },
    {
      titleVi: "Self-Hosted Security Home Lab",
      titleEn: "Self-Hosted Security Home Lab",
      url: "docker / tailscale",
      descVi: "Triển khai >8 dịch vụ Docker Compose (Portainer, Tailscale VPN, AdGuard Home chặn 90% quảng cáo).",
      descEn: "Deployed >8 self-hosted Docker services (Portainer, Tailscale VPN, AdGuard Home blocking 90% ad traffic).",
    },
    {
      titleVi: "Local Small Tattoo Website",
      titleEn: "Local Small Tattoo Website",
      url: "localsmalltattoo.com",
      descVi: "Phát triển và triển khai website cho studio xăm hình, gia cố bảo mật chống injection và misconfiguration.",
      descEn: "Developed & security-hardened production business website for a local tattoo studio.",
    },
  ],

  socials: [
    {
      label: "GitHub",
      handle: "@poqpwppy",
      url: "https://github.com/poqpwppy",
    },
    {
      label: "CTF (ARESx)",
      handle: "ARESx",
      url: "https://poqpwppy.github.io",
    },
    {
      label: "Email",
      handle: "khoa.dang@viethope.org",
      url: "mailto:khoa.dang@viethope.org",
    },
  ],

  pgpFingerprint: "E2A9 4C31 8F5D 77B1 6A2C  F0D9 3B84 5A61 92CD 04F8",
  pgpPublicKey: `-----BEGIN PGP PUBLIC KEY BLOCK-----

mQINBGZp3mMBEADBn3QJ... (public key block)
-----END PGP PUBLIC KEY BLOCK-----`,
} as const;
