/* =========================================================
   PROJECT MEDIA SYSTEM
=========================================================

   Supports:

   - multiple videos
   - multiple images
   - video only
   - image only
   - video + image
   - video + video + images
   - independent slideshow for every project

========================================================= */

(() => {

  "use strict";


  /* =======================================================
     SETTINGS
  ======================================================= */

  const IMAGE_DURATION = 5000;

  const START_DELAY = 150;

  const MEDIA_SELECTOR = "[data-media]";


  /* =======================================================
     FIND ALL PROJECT MEDIA BOXES
  ======================================================= */

  const mediaBoxes =
    document.querySelectorAll(MEDIA_SELECTOR);


  if (!mediaBoxes.length) {
    return;
  }



  /* =======================================================
     INITIALIZE EACH PROJECT
  ======================================================= */

  mediaBoxes.forEach((box) => {

    initializeMediaBox(box);

  });



  /* =======================================================
     MEDIA BOX FUNCTION
  ======================================================= */

  function initializeMediaBox(box) {


    const items =
      Array.from(
        box.querySelectorAll(".project-media")
      );


    const status =
      box.querySelector(".media-status");


    const control =
      box.querySelector(".media-control");


    /*
       Nothing to do if the project has
       no media.
    */

    if (!items.length) {
      return;
    }



    /* =====================================================
       STATE
    ===================================================== */

    let currentIndex = 0;

    let timer = null;

    let paused = false;

    let manuallyPaused = false;



    /* =====================================================
       PROJECT NAME
    ===================================================== */

    const originalStatus =
      status
        ? status.textContent.trim()
        : "Project · media";



    /* =====================================================
       CLEAR TIMER
    ===================================================== */

    function clearTimer() {

      if (timer !== null) {

        clearTimeout(timer);

        timer = null;

      }

    }



    /* =====================================================
       IS VIDEO?
    ===================================================== */

    function isVideo(item) {

      return item.tagName.toLowerCase() === "video";

    }



    /* =====================================================
       UPDATE STATUS
    ===================================================== */

    function updateStatus(item) {

      if (!status) {
        return;
      }


      const type =
        isVideo(item)
          ? "video"
          : "gallery";


      status.textContent =
        `${originalStatus} · ${type}`;

    }



    /* =====================================================
       STOP ALL VIDEOS
    ===================================================== */

    function stopAllVideos() {

      items.forEach((item) => {

        if (!isVideo(item)) {
          return;
        }


        item.pause();

        /*
           Reset the video.

           This means when it becomes visible
           again it starts from the beginning.
        */

        try {

          item.currentTime = 0;

        } catch (error) {

          /*
             Some browsers may throw if the
             media has not loaded yet.
          */

        }

      });

    }



    /* =====================================================
       HIDE ALL ITEMS
    ===================================================== */

    function hideAllItems() {

      items.forEach((item) => {

        item.classList.remove("is-active");

        item.setAttribute(
          "aria-hidden",
          "true"
        );

      });

    }



    /* =====================================================
       SHOW ITEM
    ===================================================== */

    function showItem(index) {

      clearTimer();


      /*
         Safety against invalid indexes.
      */

      if (index < 0) {
        index = items.length - 1;
      }

      if (index >= items.length) {
        index = 0;
      }


      currentIndex = index;


      hideAllItems();

      stopAllVideos();


      const item =
        items[currentIndex];


      item.classList.add("is-active");

      item.setAttribute(
        "aria-hidden",
        "false"
      );


      updateStatus(item);



      /*
         If this is a video,
         play it immediately.
      */

      if (isVideo(item)) {

        playVideo(item);

        return;
      }



      /*
         If this is an image,
         keep it visible for
         IMAGE_DURATION.
      */

      scheduleImage(item);

    }



    /* =====================================================
       PLAY VIDEO
    ===================================================== */

    function playVideo(video) {


      /*
         Ensure autoplay-safe settings.
      */

      video.muted = true;

      video.setAttribute(
        "muted",
        ""
      );

      video.setAttribute(
        "playsinline",
        ""
      );


      /*
         Start from beginning.
      */

      try {

        video.currentTime = 0;

      } catch (error) {

        // Ignore.

      }



      /*
         Play.

         Because the video is muted,
         modern browsers normally allow
         autoplay.
      */

      const promise =
        video.play();


      if (
        promise &&
        typeof promise.catch === "function"
      ) {

        promise.catch(() => {

          /*
             Autoplay was blocked.

             We leave the poster visible
             instead of breaking the gallery.
          */

          console.log(
            "Autoplay was blocked for:",
            video
          );

        });

      }

    }



    /* =====================================================
       IMAGE TIMER
    ===================================================== */

    function scheduleImage() {

      clearTimer();


      if (paused || manuallyPaused) {
        return;
      }


      timer =
        setTimeout(() => {

          nextItem();

        }, IMAGE_DURATION);

    }



    /* =====================================================
       NEXT ITEM
    ===================================================== */

    function nextItem() {

      clearTimer();


      if (
        paused ||
        manuallyPaused
      ) {

        return;

      }


      const nextIndex =
        (currentIndex + 1) %
        items.length;


      showItem(nextIndex);

    }



    /* =====================================================
       VIDEO ENDED
    ===================================================== */

    items.forEach((item) => {

      if (!isVideo(item)) {
        return;
      }


      item.addEventListener(
        "ended",
        () => {

          /*
             Only advance if the video
             that ended is actually the
             visible item.
          */

          if (
            items[currentIndex] !== item
          ) {

            return;

          }


          if (
            paused ||
            manuallyPaused
          ) {

            return;

          }


          nextItem();

        }
      );


      /*
         If video metadata loads late,
         make sure autoplay is attempted.
      */

      item.addEventListener(
        "loadeddata",
        () => {

          if (
            items[currentIndex] === item &&
            !paused &&
            !manuallyPaused
          ) {

            playVideo(item);

          }

        }
      );

    });



    /* =====================================================
       HOVER PAUSE
    ===================================================== */

    box.addEventListener(
      "mouseenter",
      () => {

        paused = true;

        clearTimer();


        const current =
          items[currentIndex];


        if (
          current &&
          isVideo(current)
        ) {

          current.pause();

        }

      }
    );



    /* =====================================================
       HOVER RESUME
    ===================================================== */

    box.addEventListener(
      "mouseleave",
      () => {

        paused = false;


        if (manuallyPaused) {
          return;
        }


        const current =
          items[currentIndex];


        if (!current) {
          return;
        }


        /*
           Resume current video.
        */

        if (isVideo(current)) {

          const promise =
            current.play();


          if (
            promise &&
            typeof promise.catch === "function"
          ) {

            promise.catch(() => {});

          }

        }


        /*
           Resume image timer.
        */

        else {

          scheduleImage();

        }

      }
    );



    /* =====================================================
       CLICK PAUSE / PLAY
    ===================================================== */

    if (control) {

      control.addEventListener(
        "click",
        (event) => {

          /*
             Prevent click from bubbling
             anywhere else.
          */

          event.preventDefault();

          event.stopPropagation();


          manuallyPaused =
            !manuallyPaused;


          const current =
            items[currentIndex];


          if (manuallyPaused) {

            clearTimer();


            if (
              current &&
              isVideo(current)
            ) {

              current.pause();

            }


            control.textContent = "▶";

            control.setAttribute(
              "aria-label",
              "Play project media"
            );

          }


          else {

            control.textContent = "II";

            control.setAttribute(
              "aria-label",
              "Pause project media"
            );


            if (
              current &&
              isVideo(current)
            ) {

              const promise =
                current.play();


              if (
                promise &&
                typeof promise.catch === "function"
              ) {

                promise.catch(() => {});

              }

            }


            else {

              scheduleImage();

            }

          }

        }
      );

    }



    /* =====================================================
       INTERSECTION OBSERVER
    =====================================================

       Don't play videos when the project is
       far outside the viewport.

    ===================================================== */

    const observer =
      new IntersectionObserver(
        (entries) => {

          entries.forEach((entry) => {

            if (entry.isIntersecting) {

              if (
                !manuallyPaused &&
                !paused
              ) {

                const current =
                  items[currentIndex];


                if (
                  current &&
                  isVideo(current)
                ) {

                  const promise =
                    current.play();


                  if (
                    promise &&
                    typeof promise.catch === "function"
                  ) {

                    promise.catch(() => {});

                  }

                }

                else if (current) {

                  scheduleImage();

                }

              }

            }

            else {

              /*
                 Pause videos when they leave
                 the viewport.

                 This saves CPU and battery.
              */

              items.forEach((item) => {

                if (isVideo(item)) {

                  item.pause();

                }

              });

            }

          });

        },
        {
          threshold: 0.15
        }
      );


    observer.observe(box);



    /* =====================================================
       REDUCED MOTION
    ===================================================== */

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;


    if (reducedMotion) {

      /*
         For users who request reduced motion,
         show the first item without automatically
         cycling.
      */

      manuallyPaused = true;

      showItem(0);

      if (control) {

        control.textContent = "▶";

      }

    }


    else {

      /*
         Start after a tiny delay so the DOM,
         video elements and browser media stack
         have time to initialize.
      */

      setTimeout(() => {

        showItem(0);

      }, START_DELAY);

    }

  }

})();