$(function () {
    "use strict";
    const $quickpick = $('.js-quickpick');
    const $cover = $('.js-cover');
    const $selectNum = $('[name=selectNum]');
    let arryNum = [];
    $('#verticaly1-1').flickEndless({
        vertical:true,
        onPageChange: function() {
            arryNum.splice(0,1,this.page);
            $selectNum.val(arryNum);
        }
    });

    $('#verticaly1-2').flickEndless({
        vertical:true,
        onPageChange: function() {
            arryNum.splice(1,1,this.page);
            $selectNum.val(arryNum);
        }
    });

    $('#verticaly1-3').flickEndless({
        vertical:true,
        onPageChange: function() {
            arryNum.splice(2,1,this.page);
            $selectNum.val(arryNum);
        }
    });

    $quickpick.on('change', function(){        
        $(this).closest('div').prev('div').children($cover).toggleClass('is-quickpick');
    });
});
