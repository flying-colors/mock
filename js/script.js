(function () {
    "use strict";
    let posData = [];
    const $containerList = document.querySelectorAll('.js-container'),
    $bnrList = document.querySelectorAll('.js-bnr');

    const generatePosData = () => {       
        const $nodeContainer = Array.from($containerList);
        $nodeContainer.forEach((elm,index)=>{
            if (!posData[index]) {
				posData[index] = {};
            }
            const containerTop = $nodeContainer[index].offsetTop;
            posData[index].containerTop = containerTop;
        });
        return posData;
    };
    
    generatePosData();

    window.addEventListener('scroll', ()=>{
        $containerList.forEach((elm,index) =>{
            if (window.pageYOffset > posData[index].containerTop - 100) {
                $containerList[index].classList.add('is-active');
                setTimeout(() => {
                    $bnrList[index].classList.add('is-active');
                }, 1000);
            }
        });
    });
})();
