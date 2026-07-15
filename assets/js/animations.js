/* =========================================================
   PaperCraft — Premium animation layer
   GSAP + ScrollTrigger + Lenis, layered on top of main.js.
   Loaded only on pages that opt in (no AOS script on those pages).
   Fails safe: if GSAP/CDN didn't load, content is revealed instantly.
   ========================================================= */

(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var pointerFine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
  if (reduceMotion) root.classList.add("reduce-motion");

  var hasGsap = !!(window.gsap && window.gsap.utils);

  /* ---------------- Fail-safe: reveal everything if GSAP didn't load ---------------- */
  if (!hasGsap) {
    document.querySelectorAll("[data-aos]").forEach(function (el) { el.style.opacity = 1; });
    var pl = document.getElementById("preloader");
    if (pl) pl.style.display = "none";
    return;
  }

  root.classList.add("gsap-ready");
  gsap.registerPlugin(ScrollTrigger);

  /* ---------------- Lenis smooth scroll ---------------- */
  var lenis = null;
  if (!reduceMotion && window.Lenis) {
    lenis = new Lenis({
      duration: 1.05,
      easing: function (t) { return 1 - Math.pow(1 - t, 3); },
      smoothWheel: true,
      touchMultiplier: 1.4
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------------- Reveal engine (shared by hero + scroll reveals) ---------------- */
  function fromVars(type) {
    switch (type) {
      case "zoom-in": return { opacity: 0, scale: 0.86 };
      case "fade-left": return { opacity: 0, x: 44 };
      case "fade-right": return { opacity: 0, x: -44 };
      default: return { opacity: 0, y: 38 };
    }
  }

  function revealEl(el, scrollTriggerCfg) {
    var type = el.getAttribute("data-aos");
    var delayMs = parseInt(el.getAttribute("data-aos-delay") || "0", 10);
    gsap.set(el, fromVars(type));
    var vars = {
      opacity: 1, x: 0, y: 0, scale: 1,
      duration: 0.9, delay: delayMs / 1000, ease: "power3.out",
      clearProps: "transform"
    };
    if (scrollTriggerCfg) vars.scrollTrigger = scrollTriggerCfg;
    gsap.to(el, vars);
  }

  var heroSection = document.getElementById("hero");
  var heroEls = heroSection ? gsap.utils.toArray("[data-aos]", heroSection) : [];

  function playHero() {
    heroEls.forEach(function (el) { revealEl(el); });
  }

  /* Everything outside the hero reveals on scroll-into-view (once). */
  gsap.utils.toArray("[data-aos]").forEach(function (el) {
    if (heroSection && heroSection.contains(el)) return;
    revealEl(el, { trigger: el, start: "top 88%", toggleActions: "play none none none" });
  });

  /* ---------------- Preloader -> hero entrance handoff ---------------- */
  var preloader = document.getElementById("preloader");
  function revealPage() {
    if (!preloader) { playHero(); return; }
    gsap.to(preloader, {
      opacity: 0, duration: 0.55, ease: "power2.inOut", delay: 0.15,
      onComplete: function () {
        preloader.style.display = "none";
        playHero();
        ScrollTrigger.refresh();
      }
    });
  }
  if (document.readyState === "complete") revealPage();
  else window.addEventListener("load", revealPage);

  /* ---------------- Parallax (hero blobs / floating cards) ---------------- */
  if (!reduceMotion) {
    gsap.utils.toArray("[data-parallax]").forEach(function (el) {
      var speed = parseFloat(el.getAttribute("data-parallax")) || 0.2;
      gsap.to(el, {
        yPercent: speed * 100,
        ease: "none",
        scrollTrigger: {
          trigger: el.closest("section") || el,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    });
  }

  /* ---------------- Pointer-following 3D tilt on cards ---------------- */
  if (!reduceMotion && pointerFine) {
    document.querySelectorAll(".tilt-hover").forEach(function (card) {
      card.style.transformPerspective = "800px";
      var rotX = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3.out" });
      var rotY = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3.out" });
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        rotY(px * 10);
        rotX(py * -10);
      });
      card.addEventListener("mouseleave", function () { rotX(0); rotY(0); });
    });
  }

  /* ---------------- Page transitions (slide-veil wipe) ---------------- */
  var veil = document.createElement("div");
  veil.id = "page-veil";
  document.body.appendChild(veil);

  function isLocalNav(link) {
    var href = link.getAttribute("href");
    if (!href || href.charAt(0) === "#") return false;
    if (link.target === "_blank" || link.hasAttribute("download")) return false;
    if (/^([a-z]+:)?\/\//i.test(href) || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return false;
    return true;
  }

  document.querySelectorAll("a[href]").forEach(function (link) {
    if (!isLocalNav(link)) return;
    link.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      var href = link.getAttribute("href");
      e.preventDefault();
      if (reduceMotion) { window.location.href = href; return; }
      gsap.to(veil, {
        y: "0%", duration: 0.45, ease: "power3.inOut",
        onComplete: function () { window.location.href = href; }
      });
    });
  });

  window.addEventListener("pageshow", function (e) {
    if (e.persisted) gsap.set(veil, { y: "101%" });
  });
})();
