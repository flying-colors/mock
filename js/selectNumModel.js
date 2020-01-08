$(function(){
    function Model(){
        this.count = 0;
        this.selectMax = 7;
        this.flagMax = false;
        this.purchanseBtnState = false;
        this.selectNums = [];
        this.selectRows = [];
    }
    
    // カウント
    function changeCount() {
        model.count++;
        if(model.count > model.selectMax){
            return false;
        }
        activatePurchanseBtn();
    }

    // 購入設定ボタンを活性/非活性
    function activatePurchanseBtn() {
        if(model.count !== 0){
            model.purchanseBtnState = true;
        } else {
            model.purchanseBtnState = false;
        }
    }

    const model = new Model();
    
    const $selectBtn = $('.js-selectBtn'),
    $purchanseBtn = $('.js-btnPurchase'),
    $resetBtn = $('.js-btnReset'),
    $addedNum = $('.js-addedNum');
    
    $selectBtn.on('click', function(){
        changeCount();
    });
});
