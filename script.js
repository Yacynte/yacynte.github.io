/* ============================================================
   PROJECT MEDIA
   ============================================================

   Behaviour:

   1. Video starts automatically.
   2. Video is muted, so browser autoplay policies allow it.
   3. Video remains visible while playing.
   4. When video ends, gallery starts.
   5. Gallery images rotate every 7 seconds.
   6. If autoplay fails, the user can click the video.
============================================================ */


document.addEventListener("DOMContentLoaded", () => {

  const mediaBoxes = document.querySelectorAll("[data-media]");

  const IMAGE_DURATION = 7000;


  mediaBoxes.forEach((box) => {

    const video = box.querySelector(".project-video");

    const images = Array.from(
      box.querySelectorAll("img")
    );

    const status = box.querySelector(".media-status");


    if (!video) {
      return;
    }


    let currentImage = 0;

    let galleryTimer = null;


    /* ========================================================
       CLEAR GALLERY TIMER
    ======================================================== */

    function clearGalleryTimer() {

      if (galleryTimer !== null) {

        clearTimeout(galleryTimer);

        galleryTimer = null;

      }

    }


    /* ========================================================
       SHOW VIDEO
    ======================================================== */

    function showVideo() {

      clearGalleryTimer();


      /*
         Video above images.
      */

      video.style.opacity = "1";


      /*
         Hide all gallery images.
      */

      images.forEach((image) => {

        image.classList.remove("is-visible");

      });


      /*
         Update label.
      */

      if (status) {

        status.textContent = "ENGEL · simulation";

      }


      /*
         Start from beginning.
      */

      try {

        video.currentTime = 0;

      } catch (error) {

        console.warn(
          "Could not reset video:",
          error
        );

      }


      /*
         Start video.
      */

      const playPromise = video.play();


      /*
         Some browsers return a Promise from play().
      */

      if (playPromise !== undefined) {

        playPromise.catch((error) => {

          console.warn(
            "Autoplay was blocked:",
            error
          );


          /*
             The video remains visible.
             The browser can now play it after
             the user clicks.
          */

          if (status) {

            status.textContent =
              "ENGEL · click to play";

          }

        });

      }

    }


    /* ========================================================
       SHOW IMAGE
    ======================================================== */

    function showImage(index) {

      /*
         Hide video.
      */

      video.style.opacity = "0";


      /*
         Show selected image.
      */

      images.forEach((image, imageIndex) => {

        image.classList.toggle(
          "is-visible",
          imageIndex === index
        );

      });


      currentImage = index;


      if (status) {

        status.textContent =
          "ENGEL · validation";

      }

    }


    /* ========================================================
       NEXT IMAGE
    ======================================================== */

    function nextImage() {

      if (images.length === 0) {
        return;
      }


      currentImage =
        (currentImage + 1) % images.length;


      showImage(currentImage);


      galleryTimer = setTimeout(
        nextImage,
        IMAGE_DURATION
      );

    }


    /* ========================================================
       START GALLERY
    ======================================================== */

    function startGallery() {

      clearGalleryTimer();


      if (images.length === 0) {
        return;
      }


      currentImage = 0;


      showImage(0);


      galleryTimer = setTimeout(
        nextImage,
        IMAGE_DURATION
      );

    }


    /* ========================================================
       VIDEO FINISHED
    ======================================================== */

    video.addEventListener(
      "ended",
      () => {

        startGallery();

      }
    );


    /* ========================================================
       VIDEO ERROR
    ======================================================== */

    video.addEventListener(
      "error",
      () => {

        console.error(
          "ENGEL video could not be loaded."
        );


        if (status) {

          status.textContent =
            "ENGEL · video unavailable";

        }

      }
    );


    /* ========================================================
       VIDEO LOADED
    ======================================================== */

    video.addEventListener(
      "loadeddata",
      () => {

        console.log(
          "ENGEL video loaded successfully."
        );

      }
    );


    /* ========================================================
       CLICK VIDEO
       ========================================================

       If autoplay was blocked, clicking the video
       starts playback.
    */

    video.addEventListener(
      "click",
      () => {

        if (video.paused) {

          video.play()
            .then(() => {

              video.style.opacity = "1";

              images.forEach((image) => {

                image.classList.remove(
                  "is-visible"
                );

              });

              if (status) {

                status.textContent =
                  "ENGEL · simulation";

              }

            })
            .catch((error) => {

              console.error(
                "Could not start video:",
                error
              );

            });

        }

      }
    );


    /* ========================================================
       REDUCED MOTION
    ======================================================== */

    const prefersReducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;


    if (prefersReducedMotion) {

      startGallery();

    } else {

      /*
         Start video immediately.
      */

      showVideo();

    }

  });

});