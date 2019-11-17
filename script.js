(function () {
    "use strict";
    const $container = document.querySelector('.js-container');
    window.addEventListener('scroll', ()=>{
        if (window.pageYOffset > 300) {
            $container.classList.add('is-active');
        } else {
            $container.classList.remove('is-active');
        }
    });
})();
