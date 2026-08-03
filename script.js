/* Oğuzhan Esgiyusufo, portfolio scripts */

(function () {
  'use strict';

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Mobile burger menu */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('navmenu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        menu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* Screenshot carousels */
  document.querySelectorAll('[data-carousel]').forEach(function (car) {
    var track = car.querySelector('.carousel__track');
    var slides = car.querySelectorAll('.carousel__slide');
    var dotsBox = car.querySelector('.carousel__dots');
    var prev = car.querySelector('.carousel__nav--prev');
    var next = car.querySelector('.carousel__nav--next');

    if (!track || slides.length < 2) {
      car.classList.add('carousel--single');
      return;
    }

    slides.forEach(function (slide, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', 'Slide ' + (i + 1));
      dot.addEventListener('click', function () {
        track.scrollTo({ left: track.clientWidth * i, behavior: 'smooth' });
      });
      dotsBox.appendChild(dot);
    });

    function sync() {
      var i = Math.round(track.scrollLeft / track.clientWidth);
      dotsBox.querySelectorAll('.carousel__dot').forEach(function (dot, n) {
        dot.classList.toggle('is-active', n === i);
      });
    }

    track.addEventListener('scroll', function () {
      window.requestAnimationFrame(sync);
    });
    prev.addEventListener('click', function () {
      track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' });
    });
    next.addEventListener('click', function () {
      track.scrollBy({ left: track.clientWidth, behavior: 'smooth' });
    });
  });
})();
