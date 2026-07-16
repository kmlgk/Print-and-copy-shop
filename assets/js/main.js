/* =========================================================
   PaperCraft — Print & Copy Shop Template
   Shared front-end behaviour
   ========================================================= */

(function () {
  "use strict";

  /* ---------------- Theme (dark / light) ---------------- */
  const root = document.documentElement;
  const THEME_KEY = "papercraft-theme";

  function applyTheme(theme) {
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    document.querySelectorAll("[data-theme-toggle] .icon-sun").forEach(el => el.classList.toggle("hidden", theme !== "dark"));
    document.querySelectorAll("[data-theme-toggle] .icon-moon").forEach(el => el.classList.toggle("hidden", theme === "dark"));
  }

  window.__papercraftSetTheme = function (theme) {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
  };

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(localStorage.getItem(THEME_KEY) || (root.classList.contains("dark") ? "dark" : "light"));

    document.querySelectorAll("[data-theme-toggle]").forEach(btn => {
      btn.addEventListener("click", () => {
        const next = root.classList.contains("dark") ? "light" : "dark";
        window.__papercraftSetTheme(next);
      });
    });

    /* ---------------- RTL toggle ---------------- */
    const DIR_KEY = "papercraft-dir";
    function applyDir(dir) {
      root.setAttribute("dir", dir);
      root.setAttribute("lang", dir === "rtl" ? "ar" : "en");
      document.querySelectorAll("[data-i18n-en]").forEach(el => {
        const en = el.getAttribute("data-i18n-en");
        const ar = el.getAttribute("data-i18n-ar");
        if (ar) el.textContent = dir === "rtl" ? ar : en;
      });
      document.querySelectorAll("[data-dir-label]").forEach(el => {
        el.textContent = dir === "rtl" ? "English" : "العربية";
      });
    }
    const savedDir = localStorage.getItem(DIR_KEY);
    if (savedDir) applyDir(savedDir);

    document.querySelectorAll("[data-dir-toggle]").forEach(btn => {
      btn.addEventListener("click", () => {
        const next = root.getAttribute("dir") === "rtl" ? "ltr" : "rtl";
        localStorage.setItem(DIR_KEY, next);
        applyDir(next);
      });
    });

    /* ---------------- Preloader ---------------- */
    const preloader = document.getElementById("preloader");
    if (preloader) {
      window.addEventListener("load", () => {
        setTimeout(() => preloader.classList.add("loaded"), 250);
      });
    }

    /* ---------------- Mobile menu ---------------- */
    const menuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    const mobileMenuBackdrop = document.getElementById("mobile-menu-backdrop");
    if (menuBtn && mobileMenu) {
      const setMenuOpen = (open) => {
        mobileMenu.classList.toggle("menu-open", open);
        mobileMenuBackdrop?.classList.toggle("menu-open", open);
        menuBtn.querySelector(".icon-open")?.classList.toggle("hidden", open);
        menuBtn.querySelector(".icon-close")?.classList.toggle("hidden", !open);
        menuBtn.setAttribute("aria-expanded", String(open));
        document.documentElement.classList.toggle("overflow-hidden", open);
        if (!open) {
          // collapse any open submenus so re-opening the menu starts fresh
          mobileMenu.querySelectorAll("[data-submenu-toggle]").forEach(btn => {
            btn.nextElementSibling?.classList.remove("submenu-open");
            btn.querySelector(".chev")?.classList.remove("rotate-180");
          });
        }
      };
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.addEventListener("click", () => {
        setMenuOpen(!mobileMenu.classList.contains("menu-open"));
      });
      mobileMenuBackdrop?.addEventListener("click", () => setMenuOpen(false));
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && mobileMenu.classList.contains("menu-open")) setMenuOpen(false);
      });
      window.addEventListener("resize", () => {
        if (window.innerWidth >= 1024 && mobileMenu.classList.contains("menu-open")) setMenuOpen(false);
      });
    }

    /* ---------------- Mobile submenu accordions ---------------- */
    document.querySelectorAll("[data-submenu-toggle]").forEach(btn => {
      btn.addEventListener("click", () => {
        const panel = btn.nextElementSibling;
        if (!panel) return;
        // Force a style/layout flush before toggling so the max-height/opacity
        // transition reliably fires on WebKit even right after the parent
        // mobile menu's own open transition (avoids a nested-transition race).
        void panel.offsetHeight;
        panel.classList.toggle("submenu-open");
        btn.querySelector(".chev")?.classList.toggle("rotate-180");
      });
    });

    /* ---------------- Sticky header shadow ---------------- */
    const header = document.getElementById("site-header");
    if (header) {
      const onScroll = () => {
        header.classList.toggle("shadow-lg", window.scrollY > 12);
        header.classList.toggle("backdrop-blur-md", window.scrollY > 12);
        header.classList.toggle("bg-white/90", window.scrollY > 12);
        header.classList.toggle("dark:bg-slate-900/90", window.scrollY > 12);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    /* ---------------- Back to top ---------------- */
    const backToTop = document.getElementById("back-to-top");
    if (backToTop) {
      window.addEventListener("scroll", () => {
        backToTop.classList.toggle("opacity-0", window.scrollY < 400);
        backToTop.classList.toggle("pointer-events-none", window.scrollY < 400);
      }, { passive: true });
      backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    }

    /* ---------------- Active nav link by page ---------------- */
    const path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-link").forEach(link => {
      const href = link.getAttribute("href");
      if (href && href.split("/").pop() === path) link.classList.add("active");
    });

    /* ---------------- FAQ accordion ---------------- */
    document.querySelectorAll("[data-faq-toggle]").forEach(btn => {
      btn.addEventListener("click", () => {
        const panel = btn.nextElementSibling;
        const isOpen = !panel.classList.contains("hidden");
        btn.closest("[data-faq-group]")?.querySelectorAll("[data-faq-toggle]").forEach(other => {
          if (other !== btn) {
            other.nextElementSibling.classList.add("hidden");
            other.querySelector(".chev")?.classList.remove("rotate-180");
            other.classList.remove("text-primary-600");
          }
        });
        panel.classList.toggle("hidden", isOpen);
        btn.querySelector(".chev")?.classList.toggle("rotate-180", !isOpen);
      });
    });

    /* ---------------- Animated counters ---------------- */
    const counters = document.querySelectorAll("[data-counter]");
    if (counters.length && "IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseFloat(el.getAttribute("data-counter"));
          const decimals = (el.getAttribute("data-counter").split(".")[1] || "").length;
          const duration = 1600;
          const start = performance.now();
          function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = (target * eased).toFixed(decimals);
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = target.toFixed(decimals);
          }
          requestAnimationFrame(tick);
          io.unobserve(el);
        });
      }, { threshold: 0.4 });
      counters.forEach(el => io.observe(el));
    }

    /* ---------------- Testimonial slider ---------------- */
    document.querySelectorAll("[data-slider]").forEach(slider => {
      const track = slider.querySelector(".slider-track");
      const slides = track ? Array.from(track.children) : [];
      let index = 0;
      function go(i) {
        index = (i + slides.length) % slides.length;
        track.style.transform = `translateX(${root.getAttribute("dir") === "rtl" ? "" : "-"}${index * 100}%)`;
        slider.querySelectorAll("[data-dot]").forEach((d, di) => d.classList.toggle("!bg-primary-600", di === index));
      }
      slider.querySelector("[data-next]")?.addEventListener("click", () => go(index + 1));
      slider.querySelector("[data-prev]")?.addEventListener("click", () => go(index - 1));
      slider.querySelectorAll("[data-dot]").forEach((dot, di) => dot.addEventListener("click", () => go(di)));
      let auto = setInterval(() => go(index + 1), 5000);
      slider.addEventListener("mouseenter", () => clearInterval(auto));
      slider.addEventListener("mouseleave", () => auto = setInterval(() => go(index + 1), 5000));
      go(0);
    });

    /* ---------------- Pricing monthly / yearly toggle ---------------- */
    const billingToggle = document.getElementById("billing-toggle");
    if (billingToggle) {
      billingToggle.addEventListener("change", () => {
        const yearly = billingToggle.checked;
        document.querySelectorAll("[data-price-monthly]").forEach(el => {
          el.textContent = yearly ? el.getAttribute("data-price-yearly") : el.getAttribute("data-price-monthly");
        });
        document.querySelectorAll("[data-billing-label]").forEach(el => el.classList.toggle("text-primary-600", (el.dataset.billingLabel === "yearly") === yearly));
      });
    }

    /* ---------------- Password visibility toggle ---------------- */
    document.querySelectorAll("[data-toggle-password]").forEach(btn => {
      btn.addEventListener("click", () => {
        const input = document.getElementById(btn.getAttribute("data-toggle-password"));
        if (!input) return;
        input.type = input.type === "password" ? "text" : "password";
        btn.querySelector(".icon-eye")?.classList.toggle("hidden");
        btn.querySelector(".icon-eye-off")?.classList.toggle("hidden");
      });
    });

    /* ---------------- File upload dropzone (dashboard) ---------------- */
    document.querySelectorAll("[data-dropzone]").forEach(zone => {
      const input = zone.querySelector("input[type=file]");
      const list = document.querySelector(zone.getAttribute("data-file-list") || "");
      function renderFiles(files) {
        if (!list) return;
        list.innerHTML = "";
        Array.from(files).forEach(file => {
          const sizeKb = (file.size / 1024).toFixed(0);
          const li = document.createElement("li");
          li.className = "flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm";
          li.innerHTML = `<span class="flex items-center gap-2 truncate"><i class="fa-solid fa-file-lines text-primary-600"></i><span class="truncate">${file.name}</span></span><span class="text-slate-400 shrink-0">${sizeKb} KB</span>`;
          list.appendChild(li);
        });
      }
      ["dragenter", "dragover"].forEach(evt => zone.addEventListener(evt, e => { e.preventDefault(); zone.classList.add("dragover"); }));
      ["dragleave", "drop"].forEach(evt => zone.addEventListener(evt, e => { e.preventDefault(); zone.classList.remove("dragover"); }));
      zone.addEventListener("drop", e => { if (e.dataTransfer.files.length) { input.files = e.dataTransfer.files; renderFiles(e.dataTransfer.files); } });
      zone.addEventListener("click", (e) => { if (e.target === input) return; input?.click(); });
      input?.addEventListener("change", () => renderFiles(input.files));
    });

    /* ---------------- Print option chips -> live price estimate (dashboard upload) ---------------- */
    const estimateEl = document.getElementById("price-estimate");
    if (estimateEl) {
      const calc = () => {
        let base = parseFloat(document.querySelector('[name="paper-size"]:checked')?.dataset.price || 0);
        let copies = parseInt(document.getElementById("copies-input")?.value || 1, 10);
        let color = parseFloat(document.querySelector('[name="color-mode"]:checked')?.dataset.price || 0);
        let binding = parseFloat(document.querySelector('[name="binding"]:checked')?.dataset.price || 0);
        const total = (base + color) * copies + binding;
        estimateEl.textContent = "$" + total.toFixed(2);
      };
      document.querySelectorAll('[name="paper-size"], [name="color-mode"], [name="binding"]').forEach(el => el.addEventListener("change", calc));
      document.getElementById("copies-input")?.addEventListener("input", calc);
      calc();
    }

    /* ---------------- Sidebar toggle (dashboards) ---------------- */
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const sidebar = document.getElementById("app-sidebar");
    const sidebarOverlay = document.getElementById("sidebar-overlay");
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("-translate-x-full");
        sidebar.classList.toggle("rtl:translate-x-full");
        sidebarOverlay?.classList.toggle("hidden");
      });
      sidebarOverlay?.addEventListener("click", () => {
        sidebar.classList.add("-translate-x-full");
        sidebarOverlay.classList.add("hidden");
      });
    }

    /* ---------------- Dropdown menus (user menu / notifications) ---------------- */
    document.querySelectorAll("[data-dropdown]").forEach(trigger => {
      const panel = document.querySelector(trigger.getAttribute("data-dropdown"));
      if (!panel) return;
      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        panel.classList.toggle("hidden");
      });
      document.addEventListener("click", (e) => {
        if (!panel.contains(e.target) && !trigger.contains(e.target)) panel.classList.add("hidden");
      });
    });

    /* ---------------- Copy to clipboard (order id / tracking) ---------------- */
    document.querySelectorAll("[data-copy]").forEach(btn => {
      btn.addEventListener("click", () => {
        navigator.clipboard?.writeText(btn.getAttribute("data-copy"));
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i>';
        setTimeout(() => btn.innerHTML = original, 1200);
      });
    });

    /* ---------------- Coming soon countdown ---------------- */
    const countdown = document.getElementById("countdown");
    if (countdown) {
      const target = new Date();
      target.setDate(target.getDate() + 18);
      function updateCountdown() {
        const diff = Math.max(0, target - new Date());
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff / 3600000) % 24);
        const m = Math.floor((diff / 60000) % 60);
        const s = Math.floor((diff / 1000) % 60);
        countdown.querySelector("[data-d]").textContent = String(d).padStart(2, "0");
        countdown.querySelector("[data-h]").textContent = String(h).padStart(2, "0");
        countdown.querySelector("[data-m]").textContent = String(m).padStart(2, "0");
        countdown.querySelector("[data-s]").textContent = String(s).padStart(2, "0");
      }
      updateCountdown();
      setInterval(updateCountdown, 1000);
    }

    /* ---------------- Newsletter / contact form demo submit ---------------- */
    document.querySelectorAll("form[data-demo-form]").forEach(form => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const feedback = form.querySelector("[data-form-feedback]");
        if (feedback) {
          feedback.classList.remove("hidden");
          setTimeout(() => feedback.classList.add("hidden"), 4000);
        }
        form.reset();
      });
    });

    /* ---------------- AOS init ---------------- */
    if (window.AOS) {
      window.AOS.init({ duration: 700, once: true, offset: 60, easing: "ease-out-cubic", anchorPlacement: "top-bottom" });
    }

    /* ---------------- Scroll progress bar ---------------- */
    const progressBar = document.createElement("div");
    progressBar.id = "scroll-progress";
    document.body.appendChild(progressBar);
    const updateProgress = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      progressBar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });

    /* ---------------- Card spotlight cursor glow ---------------- */
    document.querySelectorAll(".card-hover").forEach(card => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--x", (e.clientX - rect.left) + "px");
        card.style.setProperty("--y", (e.clientY - rect.top) + "px");
      });
    });

    /* ---------------- Magnetic CTA buttons ---------------- */
    document.querySelectorAll(".btn-shine").forEach(btn => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - rect.left - rect.width / 2) * 0.15}px, ${(e.clientY - rect.top - rect.height / 2) * 0.35}px)`;
      });
      btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
    });

    /* ---------------- Admin charts ---------------- */
    if (window.Chart && document.getElementById("revenueChart")) {
      const isDark = () => root.classList.contains("dark");
      const gridColor = () => isDark() ? "rgba(148,163,184,.15)" : "rgba(100,116,139,.12)";
      const textColor = () => isDark() ? "#94a3b8" : "#64748b";

      const revenueCtx = document.getElementById("revenueChart");
      new Chart(revenueCtx, {
        type: "line",
        data: {
          labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
          datasets: [{
            label: "Revenue",
            data: [4200,4800,4600,5400,6100,5800,6700,7200,6900,7800,8400,9100],
            borderColor: "#4f46e5",
            backgroundColor: "rgba(79,70,229,.12)",
            fill: true,
            tension: .4,
            pointRadius: 0,
            borderWidth: 3
          },{
            label: "Orders",
            data: [80,95,88,110,130,120,140,150,142,165,178,190],
            borderColor: "#f97316",
            backgroundColor: "rgba(249,115,22,.08)",
            fill: true,
            tension: .4,
            pointRadius: 0,
            borderWidth: 3,
            yAxisID: "y1"
          }]
        },
        options: {
          responsive: true,
          interaction: { mode: "index", intersect: false },
          plugins: { legend: { labels: { color: textColor(), usePointStyle: true } } },
          scales: {
            x: { grid: { display: false }, ticks: { color: textColor() } },
            y: { grid: { color: gridColor() }, ticks: { color: textColor() } },
            y1: { position: "right", grid: { display: false }, ticks: { color: textColor() } }
          }
        }
      });

      const donutCtx = document.getElementById("servicesChart");
      if (donutCtx) {
        new Chart(donutCtx, {
          type: "doughnut",
          data: {
            labels: ["Documents","Business Cards","Banners & Signs","Photo Prints","Binding"],
            datasets: [{ data: [34,22,18,16,10], backgroundColor: ["#4f46e5","#818cf8","#f97316","#fbbf24","#22c55e"], borderWidth: 0 }]
          },
          options: { plugins: { legend: { position: "bottom", labels: { color: textColor(), usePointStyle: true, padding: 16 } } }, cutout: "68%" }
        });
      }
    }
  });
})();
