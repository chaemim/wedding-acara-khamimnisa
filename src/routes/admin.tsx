import { createFileRoute, Link } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { Copy, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/button";
import { Input } from "@/components/input";

interface GuestEntry {
  id: string;
  name: string;
  note: string;
  createdAt: string;
}

const STORAGE_KEY = "lovable_guest_list";
const AUTH_KEY = "lovable_admin_authed";
const ADMIN_PASSWORD = "khamimnisa2026";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin - Tambah Daftar Tamu" },
      { name: "description", content: "Halaman admin untuk menambahkan dan mengelola daftar tamu." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestNote, setGuestNote] = useState("");
  const [guests, setGuests] = useState<GuestEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    try {
      const authValue = window.localStorage.getItem(AUTH_KEY);
      setAuthenticated(authValue === "true");
    } catch (error) {
      console.error("Unable to load auth state", error);
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setGuests(JSON.parse(raw) as GuestEntry[]);
      }
    } catch (error) {
      console.error("Unable to load guest list", error);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
    } catch (error) {
      console.error("Unable to save guest list", error);
    }
  }, [guests, loaded]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(AUTH_KEY, authenticated ? "true" : "false");
    } catch (error) {
      console.error("Unable to save auth state", error);
    }
  }, [authenticated, loaded]);

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.trim() === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setPassword("");
      setAuthError("");
      return;
    }

    setAuthError("Password salah. Silakan coba lagi.");
  };

  const handleSignOut = () => {
    setAuthenticated(false);
    setPassword("");
    setAuthError("");
  };

  const addGuest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = guestName.trim();
    if (!name) return;

    const newGuest: GuestEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      note: guestNote.trim(),
      createdAt: new Date().toISOString(),
    };

    setGuests((current) => [newGuest, ...current]);
    setGuestName("");
    setGuestNote("");
  };

  const removeGuest = (id: string) => {
    if (window.confirm("Yakin ingin menghapus tamu ini?")) {
      setGuests((current) => current.filter((guest) => guest.id !== id));
    }
  };

  const getInviteUrl = (name: string) =>
    `${typeof window !== "undefined" ? window.location.origin : ""}/?to=${encodeURIComponent(name)}`;

  const copyInviteLink = (name: string) => {
    const url = getInviteUrl(name);
    navigator.clipboard.writeText(url).catch((error) => {
      console.error("Failed to copy invitation link", error);
    });
  };

  const shareWhatsApp = (name: string) => {
    const url = getInviteUrl(name);
    const text = `Assalamu'alaikum Wr.Wb 

Dengan segala kerendahan hati, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami  

${url}

Tasyakuran
📅 *Senin-Selasa, 7 - 8 September 2026*
🏡 Rumah Mempelai Pria:
Jalan Bahagia No. 11 RT. 05/RW. 01 Banyumudal Moga, Kabupaten Pemalang

Akad & Resepsi
📅 Sabtu, 5 September 2026
🏡 Rumah Mempelai Wanita:
Jalan Raya Moga Guci Sima Krajan, RT.3/RW.5, Sima Moga, Kabupaten Pemalang.

Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu. 

Diharapkan melalui media ini sebagai pengganti undangan resmi maksud dan tujuan kami dapat tersampaikan. 

Terima kasih banyak atas perhatiannya.

Kami yang berbahagia,
Khamim & Nisa`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const clearAll = () => {
    if (window.confirm("Hapus semua daftar tamu?")) {
      setGuests([]);
    }
  };

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-background px-4 py-12 text-foreground">
        <div className="mx-auto w-full max-w-xl rounded-[32px] border border-input bg-card p-10 shadow-xl">
          <div className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Admin Login</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">Halaman Admin</h1>
          </div>

          <form className="grid gap-5" onSubmit={handleLogin}>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="admin-password">
                Password Admin
              </label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                placeholder="Masukkan password..."
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {authError ? <p className="text-sm text-destructive">{authError}</p> : null}
            <Button type="submit">Masuk</Button>
            <p className="text-xs text-muted-foreground">
            </p>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-12 text-foreground">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div className="rounded-[32px] border border-input bg-card p-8 shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-primary">Admin Panel</p>
              <h1 className="mt-3 text-4xl font-semibold">Kelola Daftar Tamu</h1>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                Buat, salin, dan bagikan undangan tamu dengan cepat. Gunakan tabel untuk menemukan data tamu lebih mudah.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" asChild>
                <Link to="/">Kembali ke Undangan</Link>
              </Button>
              <Button variant="outline" size="sm" type="button" onClick={handleSignOut}>
                Keluar
              </Button>
              <Button variant="destructive" size="sm" type="button" onClick={clearAll}>
                Hapus Semua
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-input bg-card p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Tambah Tamu Baru</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Isi nama tamu dan keterangan untuk memudahkan pengelolaan.
              </p>
            </div>
            <div className="rounded-3xl bg-muted px-4 py-3 text-sm text-muted-foreground">
              Total tamu: <span className="font-semibold text-foreground">{guests.length}</span>
            </div>
          </div>

          <form className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.8fr]" onSubmit={addGuest}>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="guest-name">
                Nama Tamu
              </label>
              <Input
                id="guest-name"
                value={guestName}
                placeholder="Masukkan nama tamu"
                onChange={(event) => setGuestName(event.target.value)}
              />
            </div>

            

            <div className="lg:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Masukkan nama terlebih dahulu sebelum menambahkan tamu.
              </p>
              <Button type="submit" disabled={!guestName.trim()}>
                Tambah Tamu
              </Button>
            </div>
          </form>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-input bg-card shadow-sm">
          <div className="border-b border-input px-6 py-5">
            <h2 className="text-2xl font-semibold">Daftar Tamu</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Data tamu disimpan secara lokal di browser. Salin tautan undangan atau bagikan langsung ke WhatsApp.
            </p>
          </div>

          {guests.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              Belum ada tamu. Tambahkan tamu untuk mulai membuat undangan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 text-sm">
                <thead className="bg-slate-950/5 text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Nama</th>
                    {/* <th className="px-6 py-4">Keterangan</th> */}
                    <th className="px-6 py-4">Tautan Undangan</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-background">
                  {guests.map((guest) => {
                    const inviteUrl = getInviteUrl(guest.name);
                    return (
                      <tr key={guest.id} className="border-t border-input/70">
                        <td className="px-6 py-4 align-top font-medium text-foreground">{guest.name}</td>
                        {/* <td className="px-6 py-4 align-top text-sm text-muted-foreground">
                          {guest.note || "-"}
                        </td> */}
                        <td className="px-6 py-4 align-top text-sm text-foreground break-all max-w-[320px]">
                          {inviteUrl}
                        </td>
                        <td className="px-6 py-4 align-top text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button variant="secondary" size="sm" type="button" onClick={() => copyInviteLink(guest.name)} title="Salin tautan" aria-label="Salin tautan">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" type="button" onClick={() => shareWhatsApp(guest.name)} title="Bagikan ke WhatsApp" aria-label="Bagikan ke WhatsApp">
                              <Send className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" type="button" onClick={() => removeGuest(guest.id)} title="Hapus tamu" aria-label="Hapus tamu">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
