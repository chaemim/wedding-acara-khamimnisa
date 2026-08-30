import { createFileRoute } from "@tanstack/react-router";
import { FormEvent, useEffect, useRef, useState } from "react";
import couple from "@/assets/couple2.png";
import ornament from "@/assets/ornament.png";
import corner from "@/assets/corner.png";
import cornerCouple from "@/assets/corner-couple.png";
import cornerMain1 from "@/assets/corner/1.png";
import cornerMain2 from "@/assets/corner/2.png";
import cornerMain3 from "@/assets/corner/3.png";
import cornerMain4 from "@/assets/corner/4.png";
import petal from "@/assets/petal.png";
import kartun from "@/assets/kartun.png";
import bgMusic from "@/assets/songs/background.mp3";
import "../styles/wedding.css";
import { db } from "../lib/firebase"; // sesuaikan path-nya
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Wedding of Abdul Khamim & Fariqotun Nisa" },
      { name: "description", content: "Undangan Digital Pernikahan Abdul Khamim & Fariqotun Nisa" },
      { property: "og:title", content: "The Wedding of Abdul Khamim & Fariqotun Nisa" },
      { property: "og:description", content: "Undangan Digital Pernikahan Abdul Khamim & Fariqotun Nisa" },
    ],
  }),
  component: Wedding,
});

// Wedding date — adjust as needed
const WEDDING_DATE = new Date("2026-09-05T10:00:00+09:00").getTime();

function useCountdown() {
  const [t, setT] = useState({ d: "00", h: "00", m: "00", s: "00" });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, WEDDING_DATE - Date.now());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);
      const s = Math.floor((diff / 1000) % 60);
      const p = (n: number) => n.toString().padStart(2, "0");
      setT({ d: p(d), h: p(h), m: p(m), s: p(s) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function timeAgo(date?: Date): string {
  if (!date) return "";
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diff < 60) return "Baru saja";
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return `${m} menit yang lalu`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `${h} jam yang lalu`;
  }
  if (diff < 2592000) {
    const d = Math.floor(diff / 86400);
    return `${d} hari yang lalu`;
  }
  if (diff < 31536000) {
    const mo = Math.floor(diff / 2592000);
    return `${mo} bulan yang lalu`;
  }
  const y = Math.floor(diff / 31536000);
  return `${y} tahun yang lalu`;
}

function Wedding() {
  const [opened, setOpened] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // ← state rsvpMessages yang BARU dengan createdAt, letakkan di sini
  const [rsvpMessages, setRsvpMessages] = useState<
    {
      name: string;
      message: string;
      createdAt?: Date;
    }[]
  >([]);

  const [rsvpName, setRsvpName] = useState("");
  const [rsvpNote, setRsvpNote] = useState("");
  const [sending, setSending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);


  // Load data real-time dari Firestore
  useEffect(() => {
    const q = query(collection(db, "ucapan"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          name: doc.data().name as string,
          message: doc.data().message as string,
          createdAt: doc.data().createdAt?.toDate() as Date | undefined,
        }));
        setRsvpMessages(data);
        setCurrentPage(1);
      },
      (error) => {
        // ← tambahkan error handler ini
        console.error("Firestore error:", error);
      },
    );

    return () => unsubscribe();
  }, []);
  const mainRef = useRef<HTMLElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const c = useCountdown();
  const guest =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("to") || "Nama Tamu"
      : "Nama Tamu";

  useEffect(() => {
    const container = mainRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 },
    );

    container.querySelectorAll(".section").forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Ensure page always starts at top after refresh and disable automatic
  // browser scroll restoration so we control where to show content.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    } catch (e) {
      // ignore
    }
    window.scrollTo(0, 0);
    return () => {
      try {
        if ("scrollRestoration" in history) history.scrollRestoration = "auto";
      } catch (e) {
        // ignore
      }
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      audio.play().catch(() => {});
    };

    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.75;
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!opened || !audio) return;

    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [opened]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleAddRsvp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!rsvpName.trim() || !rsvpNote.trim()) return;

    setSending(true);
    try {
      await addDoc(collection(db, "ucapan"), {
        name: rsvpName.trim(),
        message: rsvpNote.trim(),
        createdAt: serverTimestamp(),
      });
      setRsvpName("");
      setRsvpNote("");
    } catch (err) {
      console.error("Gagal mengirim:", err);
      alert("Gagal mengirim ucapan, coba lagi.");
    } finally {
      setSending(false);
    }
  };

  // Pagination logic
  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(rsvpMessages.length / ITEMS_PER_PAGE);
  const paginatedMessages = rsvpMessages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );


  return (
    <div className={`wedding ${opened ? "is-opened" : ""}${isPlaying ? " is-playing" : ""}`}>
      <audio ref={audioRef} src={bgMusic} loop />
      {opened && (
        <button
          className="music-toggle"
          onClick={togglePlayPause}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "🔊" : "🔇"}
        </button>
      )}
      {/* COVER */}
      <section className={`cover ${opened ? "cover--hidden" : ""}`}>
        <div className="cover__petals" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => (
            <img key={i} src={petal} alt="" className={`petal petal--${i}`} />
          ))}
        </div>
        <img src={corner} alt="" className="corner corner--tl" aria-hidden="true" />
        <img src={corner} alt="" className="corner corner--tr" aria-hidden="true" />
        <img src={corner} alt="" className="corner corner--bl" aria-hidden="true" />
        <img src={corner} alt="" className="corner corner--br" aria-hidden="true" />

        <div className="cover__inner">
          <p className="script cover__script">The Wedding of</p>
          <h1 className="names cover__names">
            <span>Abdul Khamim</span>
            <em>&amp;</em>
            <span>Fariqotun Nisa</span>
          </h1>
          <div className="divider">
            <span></span>
            <i>♥</i>
            <span></span>
          </div>
          <p className="kepada">
            Kepada Yth.
            <br />
            Bpk/Ibu/Saudara/i
          </p>
          <p className="guest">{guest}</p>
          <p className="kepada">di Tempat</p>
          <button
            className="btn-open"
            onClick={() => {
              if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
              setOpened(true);
            }}
          >
            <span className="btn-open__icon">✉</span>
            <span>Buka Undangan</span>
          </button>
        </div>
      </section>

      {/* MAIN */}
      <main className="main" ref={mainRef}>
        {/* HERO */}
        <section className="section hero">
          {opened && (
            <>
              <img
                src={cornerMain1}
                alt=""
                className="hero-corner hero-corner--tl"
                aria-hidden="true"
              />
              <img
                src={cornerMain2}
                alt=""
                className="hero-corner hero-corner--tr"
                aria-hidden="true"
              />
              <img
                src={cornerMain3}
                alt=""
                className="hero-corner hero-corner--bl"
                aria-hidden="true"
              />
              <img
                src={cornerMain4}
                alt=""
                className="hero-corner hero-corner--br"
                aria-hidden="true"
              />
            </>
          )}

          {/* <img src={ornament} alt="" className="bg-ornament" /> */}
          <img src={kartun} alt="Kartun pengantin" className="hero-kartun" />
          <p className="script hero-greeting">Assalamu'alaikum Wr. Wb.</p>
          <h2 className="names names--lg hero-names">
            <span className="hero-name hero-name--male">Abdul Khamim</span>
            <em className="hero-vs">&amp;</em>
            <span className="hero-name hero-name--female">Fariqotun Nisa</span>
          </h2>
          <p className="lead hero-lead">
            Kami akan menikah, dan kami ingin Anda
            <br />
            menjadi bagian dari hari istimewa kami!
          </p>
          <div className="countdown hero-countdown">
            {[
              { v: c.d, l: "Hari" },
              { v: c.h, l: "Jam" },
              { v: c.m, l: "Menit" },
              { v: c.s, l: "Detik" },
            ].map((x) => (
              <div key={x.l} className="count">
                <span>{x.v}</span>
                <small>{x.l}</small>
              </div>
            ))}
          </div>
          <p className="date hero-date">Sabtu, 5 September 2026</p>
          <a
            className="btn-gold hero-cta"
            href="https://www.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+Abdul+Khamim+%26+Fariqotun+Nisa&dates=20261009T030000Z/20261009T100000Z"
            target="_blank"
            rel="noreferrer"
          >
            📅 Save The Date
          </a>
        </section>

        {/* QURAN */}
        <section className="section quote">
          <p className="script">We find love...</p>
          <p className="ayat">
            “Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan
            untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia
            menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu
            benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir.”
          </p>
          <p className="ayat-src">~ QS. Ar-Rum : 21 ~</p>
        </section>

        {/* COUPLE */}
        <section className="section couple">
          <img
            src={cornerCouple}
            alt=""
            aria-hidden="true"
            className="corner couple-corner corner--tr"
          />
          <img
            src={cornerCouple}
            alt=""
            aria-hidden="true"
            className="corner couple-corner corner--tl"
          />
          <img
            src={cornerCouple}
            alt=""
            aria-hidden="true"
            className="corner couple-corner corner--bl"
          />
          <img
            src={cornerCouple}
            alt=""
            aria-hidden="true"
            className="corner couple-corner corner--br"
          />
          <p className="script">Bismillahirrahmanirrahim</p>
          <p className="lead">
            Dengan segala kerendahan hati, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri
            acara pernikahan kami.
          </p>
          <div className="couple-card">
            <img
              src={couple}
              alt="Abdul Khamim & Fariqotun Nisa"
              className="couple-img"
              loading="lazy"
            />
          </div>
          <div className="profile">
            <h3 className="names names--md">
              <span>Abdul Khamim</span>
            </h3>
            <p>Putra dari</p>
            <p>
              <strong>Bapak Ali Mahfud</strong>
              <br />
              &amp; <strong>Ibu Khodijah</strong>
            </p>
          </div>
          <div className="amp">&amp;</div>
          <div className="profile">
            <h3 className="names names--md">
              <span>Fariqotun Nisa</span>
            </h3>
            <p>Putri dari</p>
            <p>
              <strong>Alm. Bapak Slamet Fauzi</strong>
              <br />
              &amp; <strong>Ibu Sukatri</strong>
            </p>
          </div>
        </section>

        {/* EVENT */}
        <section className="section event">
          <p className="script">Wedding Event</p>
          <div className="event-card">
            <h3 className="event-card__title">Akad Nikah</h3>
            <p className="time event-card__time">Pukul 09.00 WIB - Selesai</p>
            <p className="addr-title event-card__label">Alamat</p>
            <p className="addr event-card__addr">
              <strong>Kediaman Mempelai Wanita</strong>
              <br />
              Jalan Raya Moga Guci Sima Krajan, RT.3/RW.5, Sima Moga, Kabupaten Pemalang.
            </p>
            <div className="event-date event-card__date">
              <div>SABTU</div>
              <div className="big">05</div>
              <div>
                SEPTEMBER
                <br />
                2026
              </div>
            </div>
            <a
              className="btn-gold event-card__map"
              href="https://maps.app.goo.gl/t6d2DdJPCU7jmEP87?g_st=aw"
              target="_blank"
              rel="noreferrer"
            >
              📍 Lihat Maps
            </a>
          </div>

          <div className="event-card">
            <h3 className="event-card__title">Acara</h3>
            <p className="time event-card__time">Pukul 08.00 WIB - Selesai</p>
            <p className="addr-title event-card__label">Alamat</p>
            <p className="addr event-card__addr">
              <strong>Kediaman Mempelai Pria</strong>
              <br />
              Jalan Bahagia No. 11 RT. 05/RW. 01 Banyumudal Moga, Kabupaten Pemalang
            </p>
            <div className="event-date event-card__date">
              <div>SENIN</div>
              <div className="big">07</div>
              <div>
                September
                <br />
                2026
              </div>
            </div>
            <a
              className="btn-gold event-card__map"
              href="https://maps.app.goo.gl/BtFyhTrWfBzraUMh9"
              target="_blank"
              rel="noreferrer"
            >
              📍 Lihat Maps
            </a>
          </div>
        </section>

        {/* STORY */}
        <section className="section story">
          <p className="script">Our Story</p>
          <h3 className="names names--md">
            <span>Love Story</span>
          </h3>
          <div className="story-item">
            <h4>Perkenalan</h4>
            <p>
              Kami dipertemukan oleh Allah SWT dalam keadaan yang sederhana, dan dari sanalah
              perjalanan ini bermula.
            </p>
          </div>
          <div className="story-item">
            <h4>Ta'aruf</h4>
            <p>
              Dengan niat yang baik kami menjalani proses ta'aruf, saling mengenal dalam koridor
              yang dijaga oleh keluarga.
            </p>
          </div>
          <div className="story-item">
            <h4>Khitbah</h4>
            <p>
              Dengan ridho Allah SWT, dia datang bersama keluarganya untuk meminang dan menyampaikan
              niat menuju pernikahan.
            </p>
          </div>
          <div className="story-item">
            <h4>Pernikahan</h4>
            <p>
              InsyaaAllah kami akan melangsungkan akad nikah secara sederhana. Mohon doa restu agar
              menjadi keluarga yang sakinah, mawaddah, warahmah.
            </p>
          </div>
        </section>

        {/* GIFT */}
        <section className="section gift">
          <p className="script">Wedding Gift</p>
          <h3 className="names names--md">
            <span>Kirim Hadiah</span>
          </h3>
          <p className="lead">
            Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika memberi
            adalah ungkapan tanda kasih Anda, Anda dapat memberi kado secara cashless.
          </p>
          <div className="bank-card">
            <div className="bank-card__top">DANA</div>
            <div className="bank-card__num">0857 1389 9019</div>
            <div className="bank-card__name">a.n Abdul Khamim</div>
          </div>
          <div className="bank-card bank-card--alt">
            <div className="bank-card__top">BANK BRI</div>
            <div className="bank-card__num">3791 0102 4825 533</div>
            <div className="bank-card__name">a.n Fariqotun Nisa</div>
          </div>
        </section>

        {/* RSVP */}
        <section className="section rsvp">
          <p className="script">RSVP</p>
          <h3 className="names names--md">
            <span>Kartu Ucapan</span>
          </h3>
          <p className="lead">
            Tinggalkan doa dan ucapan untuk kami. Setiap pesan akan menjadi kenangan indah.
          </p>
          <form className="rsvp-form" onSubmit={handleAddRsvp}>
            <input
              className="rsvp-input"
              value={rsvpName}
              onChange={(event) => setRsvpName(event.target.value)}
              placeholder="Nama Anda"
              aria-label="Nama"
            />
            <textarea
              className="rsvp-textarea"
              value={rsvpNote}
              onChange={(event) => setRsvpNote(event.target.value)}
              placeholder="Tulis ucapan singkat untuk kami..."
              aria-label="Pesan ucapan"
            />
            <div className="rsvp-actions">
              <button
                type="submit"
                className="rsvp-submit"
                disabled={!rsvpName.trim() || !rsvpNote.trim() || sending}
              >
                {sending ? "Mengirim..." : "Kirim Ucapan"}
              </button>
            </div>
          </form>
          <div className="rsvp-grid">
            {paginatedMessages.map((entry, index) => (
              <article key={index} className="rsvp-card">
                <p className="rsvp-card__message">"{entry.message}"</p>
                <p className="rsvp-card__name">{entry.name}</p>
                {entry.createdAt && <p className="rsvp-card__time">{timeAgo(entry.createdAt)}</p>}
              </article>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="rsvp-pagination">
              <button
                className="rsvp-pagination__btn"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                ‹
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`rsvp-pagination__btn ${currentPage === page ? "rsvp-pagination__btn--active" : ""}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className="rsvp-pagination__btn"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                ›
              </button>
            </div>
          )}
        </section>

        {/* CLOSING */}
        <section className="section closing">
          {/* <img src={ornament} alt="" className="bg-ornament" /> */}
          <p className="lead">
            Merupakan suatu kebahagiaan dan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i
            berkenan hadir dan memberikan doa restu.
          </p>
          <p className="script">Wassalamu'alaikum Wr. Wb.</p>
          <p className="kepada">Kami yang berbahagia,</p>
          <h2 className="names names--md">
            <span>Abdul Khamim &amp; Fariqotun Nisa</span>
          </h2>
          <p className="footer">Made with ♥ for our special day</p>
        </section>
      </main>
    </div>
  );
}
