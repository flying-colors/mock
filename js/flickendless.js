$(function () {
    "use strict";
    $('#verticaly').flickEndless({
        vertical:true,
        onPageChange: function(e) {
            $('input[name="num"]').val(this.page + 1);
        }
    });
});
