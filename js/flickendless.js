$(function () {
    "use strict";
    $('#verticaly1-1').flickEndless({
        vertical:true
    });

    $('#verticaly1-2').flickEndless({
        vertical:true
    });

    $('#verticaly1-3').flickEndless({
        vertical:true
    });

    const $quickpick = $('.js-quickpick');
    const $cover = $('.js-cover');

    $quickpick.on('change', function(){        
        $(this).closest('div').prev('div').children($cover).toggleClass('is-quickpick');
    });
    
});
