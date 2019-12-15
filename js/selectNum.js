(function () {
    "use strict";
    const _selectBtn = document.querySelectorAll('.js-selectBtn'),
    limitSelectNum = 7;
    _selectBtn.forEach((selectBtn)=> {
        selectBtn.addEventListener('click',(e)=>{
            e.preventDefault();
            const countSelectNum = document.getElementsByClassName('is-select').length;  
            if (countSelectNum >= limitSelectNum){
                e.target.classList.remove('is-select');
            } else {
                e.target.classList.toggle('is-select');
            }
        });
    });
})();
