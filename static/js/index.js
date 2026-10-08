window.HELP_IMPROVE_VIDEOJS = false;

function initVideoCompare(rootId, baseVideoId, overlayVideoId, overlayId, sliderId) {
  var root = document.getElementById(rootId);
  var baseVideo = document.getElementById(baseVideoId);
  var overlayVideo = document.getElementById(overlayVideoId);
  var overlay = document.getElementById(overlayId);
  var slider = document.getElementById(sliderId);

  if (!root || !baseVideo || !overlayVideo || !overlay || !slider) {
    return;
  }

  var dragging = false;

  function syncOverlaySize() {
    overlayVideo.style.width = root.clientWidth + 'px';
    overlayVideo.style.height = root.clientHeight + 'px';
  }

  function setPosition(clientX) {
    var rect = root.getBoundingClientRect();
    var ratio = (clientX - rect.left) / rect.width;
    ratio = Math.max(0.02, Math.min(0.98, ratio));
    var percent = (ratio * 100).toFixed(2) + '%';
    overlay.style.width = percent;
    slider.style.left = percent;
    slider.setAttribute('aria-valuenow', Math.round(ratio * 100));
  }

  function syncPlayback() {
    if (Math.abs(baseVideo.currentTime - overlayVideo.currentTime) > 0.08) {
      overlayVideo.currentTime = baseVideo.currentTime;
    }
  }

  function playBoth() {
    var playBase = baseVideo.play();
    var playOverlay = overlayVideo.play();
    if (playBase && playBase.catch) {
      playBase.catch(function() {});
    }
    if (playOverlay && playOverlay.catch) {
      playOverlay.catch(function() {});
    }
  }

  function onPointerDown(event) {
    dragging = true;
    root.setPointerCapture(event.pointerId);
    setPosition(event.clientX);
    event.preventDefault();
  }

  function onPointerMove(event) {
    if (!dragging) {
      return;
    }
    setPosition(event.clientX);
  }

  function onPointerUp(event) {
    dragging = false;
    if (root.hasPointerCapture(event.pointerId)) {
      root.releasePointerCapture(event.pointerId);
    }
  }

  root.addEventListener('pointerdown', onPointerDown);
  root.addEventListener('pointermove', onPointerMove);
  root.addEventListener('pointerup', onPointerUp);
  root.addEventListener('pointercancel', onPointerUp);

  slider.addEventListener('keydown', function(event) {
    var current = parseInt(slider.getAttribute('aria-valuenow') || '50', 10);
    if (event.key === 'ArrowLeft') {
      setPosition(root.getBoundingClientRect().left + ((current - 3) / 100) * root.clientWidth);
      event.preventDefault();
    } else if (event.key === 'ArrowRight') {
      setPosition(root.getBoundingClientRect().left + ((current + 3) / 100) * root.clientWidth);
      event.preventDefault();
    }
  });

  baseVideo.addEventListener('loadedmetadata', syncOverlaySize);
  overlayVideo.addEventListener('loadedmetadata', syncOverlaySize);
  window.addEventListener('resize', syncOverlaySize);

  baseVideo.addEventListener('play', function() {
    if (overlayVideo.paused) {
      overlayVideo.play().catch(function() {});
    }
  });
  baseVideo.addEventListener('pause', function() {
    if (!overlayVideo.paused) {
      overlayVideo.pause();
    }
  });
  baseVideo.addEventListener('timeupdate', syncPlayback);
  baseVideo.addEventListener('seeked', function() {
    overlayVideo.currentTime = baseVideo.currentTime;
  });
  baseVideo.addEventListener('ended', function() {
    baseVideo.currentTime = 0;
    overlayVideo.currentTime = 0;
    playBoth();
  });

  syncOverlaySize();
  setPosition(root.getBoundingClientRect().left + root.clientWidth * 0.5);
  playBoth();
}


$(document).ready(function() {
    $(".navbar-burger").click(function() {
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");
    });

    if (typeof bulmaCarousel !== 'undefined') {
      bulmaCarousel.attach('#scannet-carousel', {
        slidesToScroll: 1,
        slidesToShow: 3,
        loop: true,
        infinite: true,
        autoplay: false,
        navigation: true,
        pagination: true,
      });
    }

    if (typeof bulmaSlider !== 'undefined') {
      bulmaSlider.attach();
    }

    // Ensure muted demo clips start playing (browsers may skip some autoplay videos).
    document.querySelectorAll('.demo-clip video, .results-carousel video').forEach(function(video) {
      video.muted = true;
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function() {});
      }
    });
})
