/* ==========================================================
   ARGENT — vanilla JS behavior (no framework, no build step)
   Handles: nav toggle, scroll effects, reveal animations,
   stat counters, and the EmailJS-powered contact form.
   ========================================================== */

(function ()
{
  "use strict";

  /* -----------------------------------------------------------
     EmailJS configuration
     Create a free account at https://www.emailjs.com, then:
       1. Add an Email Service  -> copy its Service ID
       2. Create an Email Template -> copy its Template ID
          (template should expect: user_name, user_email,
           subject, message)
       3. Account > General -> copy your Public Key
     Paste the three values below.
  ----------------------------------------------------------- */
  var EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
  var EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
  var EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";

  function init()
  {
    initEmailJS();
    initNavToggle();
    initHeaderScroll();
    initSmoothNavClose();
    initRevealOnScroll();
    initStatCounters();
    initContactForm();
    initFooterYear();
  }

  if (document.readyState === "loading")
  {
    document.addEventListener("DOMContentLoaded", init);
  }
  else
  {
    init();
  }

  /* ---------------------- EmailJS init ---------------------- */
  function initEmailJS()
  {
    if (window.emailjs && EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY")
    {
      window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    }
  }

  /* ---------------------- Mobile nav ---------------------- */
  function initNavToggle()
  {
    var toggle = document.getElementById("navToggle");
    var links = document.getElementById("navLinks");
    if (!toggle || !links) return;

    toggle.addEventListener("click", function ()
    {
      var isOpen = links.classList.toggle("is-open");
      toggle.classList.toggle("is-active", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
  }

  function initSmoothNavClose()
  {
    var links = document.getElementById("navLinks");
    var toggle = document.getElementById("navToggle");
    if (!links) return;

    var navLinks = links.querySelectorAll("[data-nav-link]");
    navLinks.forEach(function (link)
    {
      link.addEventListener("click", function ()
      {
        links.classList.remove("is-open");
        if (toggle)
        {
          toggle.classList.remove("is-active");
          toggle.setAttribute("aria-expanded", "false");
        }
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------------------- Header shadow on scroll ---------------------- */
  function initHeaderScroll()
  {
    var header = document.getElementById("header");
    if (!header) return;

    function update()
    {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ---------------------- Reveal-on-scroll ---------------------- */
  function initRevealOnScroll()
  {
    var targets = document.querySelectorAll(".reveal");
    if (!targets.length) return;

    if (!("IntersectionObserver" in window))
    {
      targets.forEach(function (el)
      {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries)
      {
        entries.forEach(function (entry)
        {
          if (entry.isIntersecting)
          {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    targets.forEach(function (el)
    {
      observer.observe(el);
    });
  }

  /* ---------------------- Stat counters ---------------------- */
  function initStatCounters()
  {
    var counters = document.querySelectorAll(".stat-num[data-count]");
    if (!counters.length) return;

    var animated = new WeakSet();

    function animate(el)
    {
      if (animated.has(el)) return;
      animated.add(el);

      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var duration = 1400;
      var start = null;

      function step(timestamp)
      {
        if (start === null) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window))
    {
      counters.forEach(animate);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries)
      {
        entries.forEach(function (entry)
        {
          if (entry.isIntersecting)
          {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach(function (el)
    {
      observer.observe(el);
    });
  }

  /* ---------------------- Contact form (EmailJS) ---------------------- */
  function initContactForm()
  {
    var form = document.getElementById("contactForm");
    var status = document.getElementById("formStatus");
    var submitBtn = document.getElementById("submitBtn");
    var submitText = document.getElementById("submitText");
    if (!form) return;

    form.addEventListener("submit", function (e)
    {
      e.preventDefault();

      if (!form.checkValidity())
      {
        form.reportValidity();
        return;
      }

      if (!window.emailjs || EMAILJS_PUBLIC_KEY === "YOUR_PUBLIC_KEY")
      {
        setStatus(
          "Contact form is not connected yet — add your EmailJS keys in /public/js/main.js.",
          "error"
        );
        return;
      }

      setLoading(true);
      setStatus("", "");

      window.emailjs
        .sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form)
        .then(function ()
        {
          setStatus("Message sent — we'll be in touch shortly.", "success");
          form.reset();
        })
        .catch(function (err)
        {
          console.error("EmailJS error:", err);
          setStatus(
            "Something went wrong sending your message. Please try again.",
            "error"
          );
        })
        .finally(function ()
        {
          setLoading(false);
        });
    });

    function setLoading(isLoading)
    {
      if (submitBtn) submitBtn.disabled = isLoading;
      if (submitText)
      {
        submitText.textContent = isLoading ? "Sending..." : "Send Message";
      }
    }

    function setStatus(message, type)
    {
      if (!status) return;
      status.textContent = message;
      status.className = "form-status" + (type ? " " + type : "");
    }
  }

  /* ---------------------- Footer year ---------------------- */
  function initFooterYear()
  {
    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
  }
})();
