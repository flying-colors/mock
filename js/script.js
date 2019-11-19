(function () {
    "use strict";
    let posData = [];
    const generatePosData = () => {
        let $containerList = document.querySelectorAll('.js-container');        
        $containerList = Array.from($containerList);
        $containerList.forEach((elm,index)=>{

            if (!posData[index]) {
				posData[index] = {};
            }
            
            const containerTop = $containerList[index].offsetTop;
            posData[index].containerTop = containerTop;
        });
        console.log(posData);
        return posData;
    };

    generatePosData();

    const $container = document.querySelector('.js-container');

    window.addEventListener('scroll', ()=>{

        if (window.pageYOffset > 300) {
            $container.classList.add('is-active');
        } else {
            $container.classList.remove('is-active');
        }
    });
})();
