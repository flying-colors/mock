(function () {
    const $checkbox = document.getElementById('checkbox'),
          $btnApp = document.getElementById('btnApp');

    $checkbox.addEventListener('change' ,(e)=>{
        if(e.target.checked) {
            $btnApp.disabled = false;
            $btnApp.classList.remove('is-disabled');
        } else {
            $btnApp.disabled = true;
            $btnApp.classList.add('is-disabled');
        }
    });
})();
